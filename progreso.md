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
- [ ] Commit + push de fase 2 a `claude/rescoldo-landing-page-4sbr8k` — *siguiente paso*
- [ ] Mostrarle capturas/resumen al cliente y esperar aprobación antes de Fase 3

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

## Entregable final (pendiente)

- [ ] `README.md` con instrucciones de deploy en Vercel
- [ ] Sección de cómo rearmar la demo con la marca de otro cliente en 15 minutos
