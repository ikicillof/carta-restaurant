# Pipeline de modelos 3D

Flujo para agregar el modelo 3D de un plato a la carta.

## 1. Generar el GLB con Meshy

1. Generá el modelo en [Meshy](https://www.meshy.ai/) a partir de una foto o
   un prompt del plato.
2. Exportalo en formato **GLB** (no GLTF+bin separado).
3. Guardalo en `public/models/raw/` con un nombre descriptivo, por ejemplo
   `public/models/raw/provoleta-al-rescoldo.glb`. Esa carpeta no se sube al
   repo (ver `.gitignore`), es solo tu carpeta de trabajo local.

Los exports de Meshy suelen venir con escalas y pivotes arbitrarios — no
hace falta corregirlos a mano. El visor (`src/components/viewer/PlatoModel.tsx`)
centra y reescala cualquier modelo automáticamente para que el zoom de la
cámara funcione igual para todos los platos.

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
