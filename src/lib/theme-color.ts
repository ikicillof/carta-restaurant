/**
 * Lee un color de marca desde los custom properties de Tailwind (@theme en
 * globals.css) en vez de hardcodearlo en componentes de three.js, donde las
 * clases de Tailwind no aplican. El fallback solo cubre el instante previo
 * al montaje en cliente.
 */
export function getThemeColor(cssVar: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  return valor || fallback;
}
