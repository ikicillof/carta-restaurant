# Pipeline de modelos 3D

Flujo para agregar el modelo 3D de un plato a la carta.

## 1. Generar el GLB

```bash
node scripts/generate-models.mjs bife-de-chorizo
```

El generador arma el modelo por código y lo deja en `public/models/raw/`
(esa carpeta no se sube al repo, ver `.gitignore`). Cada plato se compone
por capas apiladas — base de pizarra → tabla → la comida — y cada capa es un
**superelipsoide**: la familia de sólidos que interpola entre esfera y caja
según dos exponentes, que es justo lo que hace falta para describir tanto
una tabla aserrada como un corte de carne con una sola fórmula cerrada.

Sobre esa base:

- La comida lleva **desplazamiento con ruido FBM** sobre la normal de la
  malla, para que la silueta sea irregular en vez del óvalo perfecto que
  sale de la fórmula.
- Las texturas PBR (color, normal y ORM) se hornean en el mismo script. El
  normal map sale de derivar con Sobel el mismo campo de alturas que genera
  el color, así el relieve coincide con lo que se ve.
- La paleta se deriva de la foto real del plato (`public/images/platos/`)
  con peso bajo: alcanza para que el modelo y la carta no parezcan dos
  platos distintos, sin arrastrar todo a un marrón plano.

Para depurar una textura conviene mirarla plana antes que sobre el modelo —
es la forma rápida de separar un bug de horneado de uno de mapeo UV:

```bash
DUMP_TEX=/tmp/tex node scripts/generate-models.mjs bife-de-chorizo
```

Las recetas viven en la constante `RECETAS` al final del script. Agregar un
plato es agregar una entrada ahí.

Si en algún momento se reemplaza un modelo por uno hecho en una herramienta
externa, basta con dejar el `.glb` en `public/models/raw/`: el visor
(`src/components/viewer/PlatoModel.tsx`) centra y reescala cualquier modelo
automáticamente, sin importar con qué escala o pivote venga exportado.

## 2. Optimizar

Corré:

```bash
npm run optimize:models
```

Esto toma todo lo que haya en `public/models/raw/` y por cada archivo:

- Compacta la geometría con **Draco** (soportado automáticamente por el
  visor, no requiere tocar código).
- Aplica el resto de las optimizaciones estándar de
  [`gltf-transform optimize`](https://gltf-transform.dev/cli): dedup,
  flatten, join de meshes, weld, simplify, prune de propiedades sin usar,
  etc.
- Comprime las texturas a **WebP** por default (no necesita instalar nada
  extra).
- Escribe el resultado en `public/models/<nombre>.glb` — esa sí es la
  carpeta que se commitea y se sirve en producción.
- Avisa si el archivo final superó el presupuesto de **3MB**.

### Texturas KTX2 (opcional)

WebP ya reduce bastante el tamaño de texturas sin depender de nada externo.
Si además querés **KTX2** (mejor uso de VRAM en el dispositivo, no solo
menos peso de transferencia), instalá primero el CLI `ktx` de
[KTX-Software](https://github.com/KhronosGroup/KTX-Software/releases) y
corré:

```bash
npm run optimize:models -- --ktx2
```

Sin el binario `ktx` en el `PATH`, el script corta con un mensaje claro en
vez de fallar a mitad de camino.

## 3. Conectar el modelo al plato

Editá `src/data/menu.json` y cambiá el campo `modelo` del plato de `null` a
la ruta del archivo optimizado:

```diff
- "modelo": null
+ "modelo": "/models/provoleta-al-rescoldo.glb"
```

Con eso alcanza: el botón "Ver en 3D" en la card del plato aparece solo
porque `modelo` dejó de ser `null` (ver `src/components/menu/DishCard.tsx`),
no hay que tocar ningún componente.

## Notas

- Mientras `modelo` sea `null`, el visor muestra una primitiva (un cilindro
  con material cerámico) para poder probar el modal sin depender de tener
  el GLB ya listo.
- El GLB real recién se descarga cuando alguien abre el modal (o al pasar
  el mouse por la card en desktop, que dispara un prefetch) — nunca en el
  load inicial de la página.
- Si un modelo no carga (404, archivo corrupto) o el navegador no soporta
  WebGL, el visor cae a la foto del plato con un mensaje corto en vez de
  mostrar un canvas roto.
