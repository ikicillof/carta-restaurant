# Progreso — Landing Rescoldo

Checklist de trabajo para retomar entre sesiones. Se tilda un ítem recién
cuando está hecho **y** se revisó que no rompió nada (`tsc --noEmit`,
`npm run lint`, `npm run build`, y una revisión visual cuando aplica).

Rama de trabajo: `claude/rescoldo-landing-page-4sbr8k`. `main` existe y
tiene mergeado (fast-forward) todo lo de la Fase 1.

## Fase 1 — Estructura, datos, diseño estático ✅ (aprobada por el cliente)

- [x] Proyecto Next.js (App Router, `output: 'export'`, TS estricto, Tailwind v4 con tokens de marca)
- [x] Fuentes Fraunces/Inter self-hosted vía `next/font`
- [x] `src/data/types.ts` + `restaurant.json` + `menu.json` (13 platos) + `reviews.json` (8 reseñas)
- [x] `lib/reviews.ts` (adaptador `getReviews`), `lib/format.ts` (precio ARS, horarios, fecha relativa, whatsapp)
- [x] Logo SVG inline (completo/compacto/glyph) + favicon `app/icon.svg`
- [x] Header sticky (aparece tras el hero), Hero, Sobre nosotros
- [x] Carta: nav de categorías sticky + scrollspy, grilla de platos, tags, precio `Intl.NumberFormat`
- [x] Reseñas: estrellas, avatar iniciales, promedio/distribución calculados, sin marca Google
- [x] Visitanos: horarios con día actual resaltado (client-side, evita mismatch de hidratación), mapa SVG ilustrado (sin iframe), botón Cómo llegar
- [x] Footer con aviso de datos de demo
- [x] Imágenes placeholder SVG para los 13 platos + mapa del barrio
- [x] Bug encontrado y corregido: `CategoryNav` hacía `scrollIntoView` en el pill activo al montar y scrolleaba toda la página al cargar
- [x] `tsc --noEmit`, `eslint`, `next build` (export estático) limpios
- [x] QA visual con Playwright en mobile/tablet/desktop
- [x] Commit + push a `claude/rescoldo-landing-page-4sbr8k`
- [x] Rama `main` creada y pusheada con el mismo contenido

## Fase 2 — Visor 3D ✅ (lista, pendiente de aprobación del cliente)

- [x] Instalar `three` + `@react-three/fiber` + `@react-three/drei` (versiones compatibles con React 19 / Next 16)
- [x] `DishModal`: `role="dialog"` + `aria-modal`, focus trap (Tab/Shift+Tab), cierre con Escape/backdrop/botón, scroll lock del body, devuelve foco al trigger al cerrar
- [x] `ModelViewerCanvas` cargado con `dynamic(..., { ssr:false })` — **verificado que three/drei/R3F NO entran en el bundle inicial** (bug encontrado y corregido: el import estático de `useGLTF` en `DishCard` y el import estático de `DishModal` metían ~950KB en el HTML inicial; ahora todo el árbol del visor es dinámico)
- [x] `PlatoModel`: primitiva cilindro cerámico cuando `modelo` es `null`, `useGLTF` cuando hay path real; normalización de escala/centro por bounding box (para que min/maxDistance de OrbitControls sirva para cualquier GLB futuro)
- [x] `Environment preset="studio"` + `ContactShadows` + `OrbitControls` (enablePan false, min/maxDistance, autoRotate que para al primer input, hint "arrastrá para girar" a los 800ms)
- [x] Bug encontrado y corregido: `PlatoModel` y `Environment` compartían el mismo `Suspense`, así que un HDRI lento/caído tapaba también la primitiva (que no necesita cargar nada). Ahora son boundaries separados y el modelo se muestra apenas está listo, independiente del entorno
- [x] Bug encontrado y corregido: al contenedor del visor le faltaba la clase `bg-visor` (quedaba con el fondo oscuro del modal)
- [x] Luces base (ambient + 2 directional, tibias) para que el plato se vea bien aunque el HDRI tarde o falle
- [x] Loader con `useProgress` (porcentaje), visibilidad atada a un callback `onReady` del modelo (no al progreso global, para no quedar pegado si el Environment tarda)
- [x] Fallback sin WebGL (detección antes de montar el Canvas) y fallback por error de carga (`ErrorBoundary`) → foto del plato + mensaje corto, nunca canvas negro
- [x] `useGLTF.preload` on hover de desktop, importado dinámicamente (no como import estático) para no inflar el bundle
- [x] Botón "Ver en 3D" en `DishCard` solo cuando `plato.modelo !== null` (hoy no aparece en ningún plato porque el JSON arranca todo en `null`, tal cual pide el brief — se activa solo con datos, sin tocar código)
- [x] QA con harness temporal (`/dev-viewer-test`, borrado antes de commitear): placeholder desktop/mobile, modelo roto → fallback, sin WebGL → fallback, focus trap, Escape, backdrop, reduced-motion (autoRotate off + hint oculto)
- [x] **Pipeline de modelos**: `public/models/README.md` (flujo Meshy → GLB → optimización, incluye nota de que Draco/meshopt ya funcionan solos con el visor porque `useGLTF` de drei trae los decoders por default)
- [x] Script `npm run optimize:models` (`scripts/optimize-models.mjs`) con `@gltf-transform/cli`: Draco + WebP por default (cero instalación extra), `--ktx2` opcional si hay `ktx` CLI instalado (si no está, corta con mensaje claro en vez de fallar a mitad de camino). Probado de punta a punta con un GLB de prueba generado a mano (geometría + material, sin dependender de tener un Meshy real) y con `--ktx2` sin el binario para confirmar el mensaje de error. `public/models/raw/` gitignoreado (solo se commitean los `.glb` ya optimizados)
- [x] Revisión final: `tsc --noEmit` + `eslint` + `npm run build` limpios con todo lo de fase 2 adentro; JS inicial gzip sigue en ~179KB (three/R3F/drei confirmado fuera del bundle inicial)
- [x] Regresión de fase 1: sin bug de scroll-jump al cargar, sin botones "Ver en 3D" fantasma (los 13 platos siguen en `modelo: null`), sin errores de consola
- [x] Commit + push de fase 2 a `claude/rescoldo-landing-page-4sbr8k`
- [ ] Mostrarle capturas/resumen al cliente y esperar aprobación antes de Fase 3 — *siguiente paso*

## Fase 3 — Animaciones de scroll (no arrancada)

- [ ] Instalar GSAP + ScrollTrigger + Lenis (solo se cargan en desktop ≥1024px, detectado con `matchMedia` en runtime, nunca por CSS solo)
- [ ] Desktop: Lenis smooth scroll, hero pinneado (logo escala/fade, fondo carbón→brasa), "Sobre nosotros" entra desde abajo, stagger de platos al entrar en viewport
- [ ] Mobile/tablet (<1024px): sin Lenis, sin pin, reveals con `IntersectionObserver` (fade + translate corto)
- [ ] `prefers-reduced-motion: reduce`: todo el movimiento desactivado, contenido visible de entrada, autorotación del visor también apagada (ya implementado en fase 2, revisar que siga bien)
- [ ] Todo con transform/opacity, nunca propiedades que disparen layout

## Fase 4 — SEO, Open Graph, performance, accesibilidad (no arrancada)

- [ ] Metadata completa App Router + OG image 1200x630 generada con `next/og`
- [ ] JSON-LD `Restaurant` (`hasMenu`, `openingHoursSpecification`, `address`, `aggregateRating` desde los datos reales)
- [ ] `next/image` con `sizes` correctos en todos lados (ya se usa en fase 1/2, revisar cobertura completa) + AVIF/WebP donde aplique
- [ ] Presupuesto de performance: LCP <2.5s en 4G simulada, JS inicial <200KB gzip (en fase 2 ya está en ~180KB gzip sin GLB/3D — revisar que siga así con fase 3 sumada), peso total carga inicial <1.5MB
- [ ] Accesibilidad: contraste AA (ya verificado `ceniza` sobre `carbon`/`grafito` en fase 1, revisar bajo nueva paleta si cambia), navegación completa por teclado, `alt` descriptivos, jerarquía de headings, foco visible
- [ ] Lighthouse mobile — apuntar a 90+ en las 4 categorías, reportar números reales

## Refactor de diseño con impeccable + skills de emilkowalski ✅

Pedido del cliente: sacar el look "hecho por IA" (todo con bordes
redondeados) y subir el nivel de craft general, siguiendo las reglas de
las skills instaladas.

- [x] Instalado desde `github.com/ikicillof/claude-setup`: 10 skills sueltas
      de `emilkowalski/skills` (animate-expo, animation-vocabulary,
      apple-design, ask-sonner, find-animation-opportunities,
      improve-animations, pick-ui-library, prototype, review-animations,
      write-swift) en `~/.claude/skills/`, y 4 plugins vía marketplace:
      `iart-ai/web-animation-skills`, `iart-ai/webgl-animation-skills`,
      `iart-ai/motion-design-skills` (sin `motion-background`, redundante) y
      `pbakaus/impeccable` — los 4 con scope `user`, quedan disponibles en
      cualquier sesión futura, no solo esta
- [x] Revisado el código fuente del plugin `impeccable` antes de instalarlo
      (sin ofuscación, descarga del binario verificada por sha256, sin red
      flags) — el plugin trae hooks `PostToolUse`/`Stop` que correrían su
      detector automáticamente después de edits en archivos de UI, pero
      **no se activaron**: quedan apagados hasta que alguien corra
      `/impeccable hooks on` en un proyecto puntual (confirmado con
      `impeccable context`, que reportó ningún hook activo esta sesión)
- [x] Corrido `impeccable detect` (CLI mecánico + navegador real vía
      Playwright, ya que el detector no traía Chrome propio en este
      sandbox) sobre la página en vivo. Hallazgos reales corregidos:
      - Contraste 4.1:1 en avatar cobre+texto carbon → nuevo token
        `--color-cobre-chip` (cobre aclarado ~14%) en `globals.css`
      - Texto funcional de 10px ("Hoy" en Horarios) → 12px
      - Chips/tags en 11px → 12px (piso de legibilidad)
      - Línea de ~100 caracteres en el aviso del footer → `max-w-md`
      - `animate-bounce` (easing elástico, marcado "slop") en el indicador
        de scroll del Hero → keyframe `float` propio con ease-in-out
      - Font "overused" (Fraunces + Inter aparecen en la lista de fuentes
        saturadas de IA) → **no se tocó**: el brief original del cliente
        fijó esas dos fuentes explícitamente, y la propia skill dice "el
        brief gana" sobre esta advertencia
      - "cramped-padding" en la nav de categorías → falso positivo
        confirmado visualmente (el detector mide el padding del contenedor
        con el borde, no el de los `<a>` hijos que ya tienen `py-3`)
- [x] Sistema de bordes con intención (pedido explícito: "no todo bordes
      redondeados"): 0 en contenedores estructurales (cards de platos y
      reseñas, panel de resumen, modal del visor, marco del mapa), 2px en
      botones/chips/badges/CTAs, círculo solo en lo que es redondo por
      naturaleza (avatares, spinner del loader, botón cerrar del modal)
- [x] Nav de categorías: de pills rellenos a tabs con subrayado (menos
      "scaffolding" genérico, más carta de restaurante editorial)
- [x] Scrollbar temáticada (webkit + firefox) — detalle de craft-floor.md:
      "lo más barato de mostrar que la página fue diseñada, no ensamblada"
- [x] `tsc --noEmit` + `eslint` + `npm run build` limpios; QA visual
      desktop/mobile en Carta, Reseñas, Visitanos y Hero

## Fotos reales de platos con Nano Banana ✅

- [x] Generadas las 14 imágenes (13 platos + fondo de ambiente del
      restaurante) con Gemini/Nano Banana, usando prompts con guía de
      estilo compartida (fotografía real, tonos cobre/ámbar, fondo oscuro
      desenfocado, props rústicos) armados a partir de nombre+descripción
      de cada plato en `menu.json`
- [x] Resuelto el problema de traspaso: las imágenes pegadas en el chat no
      quedan accesibles como archivo en esta sesión — el usuario las subió
      a Google Drive (sueltas, no en zip, por el límite de 10MB de la
      herramienta de descarga) y se bajaron una por una vía la API de
      Drive, identificando visualmente cada una contra el prompt que le
      correspondía (los nombres de archivo de Gemini son hashes sin
      relación al contenido)
- [x] Optimizadas con `sharp` (resize a 1400px de ancho, JPEG calidad 82) →
      ~80-160KB cada una, guardadas en `public/images/platos/<id>.jpg`
      reemplazando los placeholders SVG; fondo de ambiente en
      `public/images/restaurante-ambiente.jpg` (2400px, para uso futuro en
      fase 3, ej. hero animado)
- [x] `menu.json` actualizado (imagen: `.svg` → `.jpg` para los 13 platos),
      SVGs viejos borrados
- [x] `tsc --noEmit` + `eslint` + `npm run build` limpios; QA visual
      desktop confirmando que cada foto corresponde al plato correcto
- [x] La API key de Gemini que pasó el usuario se usó solo para probar
      cuota (sin costo, dio 429 por falta de billing) y se descartó — no
      quedó guardada en ningún lado, ni en el repo ni en el filesystem
      persistente

## Modelos 3D procedurales ✅ (1 de 13 platos)

Meshy quedó descartado: el plan gratuito genera pero no deja exportar el
GLB, y este entorno no puede manejar un navegador contra sitios externos
(el proxy resetea la conexión con cualquier host, incluso `example.com`).
Tampoco hay GPU para correr un image-to-3D local. Así que los modelos se
generan por código.

- [x] `scripts/generate-models.mjs` + `scripts/lib/{procedural,texturas}.mjs`:
      generador de sólidos superelipsoidales por capas (pizarra → tabla →
      comida), con desplazamiento FBM sobre la normal de la malla y
      horneado de texturas PBR (color + normal por Sobel + ORM)
- [x] Paleta derivada de la foto real de cada plato, con peso bajo para que
      el modelo pegue con la carta sin irse a un marrón plano
- [x] `bife-de-chorizo.glb` conectado en `menu.json` — 0.20MB optimizado
      (Draco + texturas WebP), muy por debajo del presupuesto de 3MB
- [x] Decoder de Draco self-hosteado en `public/draco/`: drei lo bajaba por
      default del CDN de gstatic, o sea que el primer modelo real del sitio
      dependía de un tercero
- [x] `Environment` armado con Lightformers en vez de `preset`: los presets
      bajan un HDRI de otro CDN, y de eso dependía que un material PBR se
      viera como algo más que una mancha oscura
- [x] Sombras entre capas: `castShadow` en el `<primitive>` no baja a las
      mallas del GLTF (hay que recorrerlo), el frustum de sombra estaba
      dimensionado para 10×10 unidades con un modelo de 1.5, y el IBL tapaba
      la sombra proyectada. Los tres arreglados — sin eso el apilado se veía
      como calcomanías superpuestas
- [ ] Faltan recetas para los otros 12 platos (empanadas, provoleta, flan,
      papas… cada forma necesita su propia composición)

## Entregable final (pendiente)

- [ ] `README.md` con instrucciones de deploy en Vercel
- [ ] Sección de cómo rearmar la demo con la marca de otro cliente en 15 minutos
