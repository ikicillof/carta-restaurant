# Gemma — Prompts para Claude Code

Tienda online e-commerce de impresiones 3D para el hogar. Prompts pensados
para usar con los plugins **superpowers**, **impeccable** y **ecc**.

## Antes de empezar

1. Creá un repo nuevo y vacío (ej. `gemma-tienda`) y abrí Claude Code ahí.
2. Copiá la carpeta `brand/` a `docs/brand/` del repo nuevo
   (brandbook `.docx` + los 2 logos: `logo-1.png`, `logo-2.png` — renombralos
   a logotipo completo / isotipo según corresponda).
3. Tené a mano: productos con fotos y precios, envíos, medios de pago y
   si ya tenés cuenta de Mercado Pago.

> Nota: este repo (`carta-restaurant`) contiene otro proyecto (landing de
> restaurante con visor 3D). Del visor (`components/viewer/`, `public/draco/`)
> se puede reutilizar código para ver los productos en 3D.

## Orden de uso

| # | Archivo | Plugin principal | Objetivo |
|---|---------|------------------|----------|
| 0 | `00-fundamentos.md` | superpowers (brainstorming) | Definir alcance, pagos, envíos, MVP |
| 1 | `01-direccion-de-diseno.md` | impeccable | Sistema de diseño y dirección visual |
| 2 | `02-plan-y-scaffold.md` | superpowers (writing-plans) | Plan de tareas y estructura del proyecto |
| 3 | `03-ejecucion.md` | superpowers + ecc reviewers | Construir tarea por tarea con TDD y revisión |
| 4 | `04-pulido-visual.md` | impeccable | QA visual y fidelidad de marca |
| 5 | `05-cierre.md` | ecc | Accesibilidad, SEO, seguridad, E2E, performance |

## Referencia del catálogo actual (Empretienda)

https://gemmanoname.empretienda.com.ar/

- Productos: lámparas (Lumalee, Diamante, Emilia), calendarios perpetuos,
  estante goteo, porta llaves ondas, soporte notebook, figuras, relojes.
- Precios de $8.000 a $45.000 ARS; 10% off por transferencia o efectivo.
- Hasta 12 cuotas, Mercado Pago, envíos por Correo Argentino, retiro en Vicente López.
- Home: grilla de productos, banners de confianza, botón de arrepentimiento en el footer.
