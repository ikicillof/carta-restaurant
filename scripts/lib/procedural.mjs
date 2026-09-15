/**
 * Primitivas de geometría y ruido para generar los modelos 3D de los platos.
 *
 * La forma base de todo es un **superelipsoide**: la familia de sólidos que
 * interpola entre esfera y caja según dos exponentes. Nos sirve porque un
 * corte de carne, una tabla o un plato son todos "cajas con los bordes
 * redondeados" en distinto grado, y el superelipsoide da exactamente eso
 * con una fórmula cerrada (sin booleanas ni subdivisión iterativa).
 *
 *   F(p) = ( |x/a|^(2/e2) + |z/c|^(2/e2) )^(e2/e1) + |y/b|^(2/e1)
 *
 * La superficie es F(p) = 1. Como F es homogénea, para una dirección
 * unitaria d el punto de la superficie es s·d con s = F(d)^(-e1/2), así que
 * se puede muestrear sin resolver nada numéricamente.
 */

/* ------------------------------ ruido ------------------------------ */

function hashInt(i) {
  let x = Math.imul(i ^ (i >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function hash3(x, y, z) {
  return hashInt(
    (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177)) | 0
  );
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;

/** Ruido de valor 3D con interpolación quíntica. Devuelve [-1, 1]. */
export function noise3(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const w = fade(z - zi);
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);

  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), u);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w) * 2 - 1;
}

/** Ruido fractal (suma de octavas). Devuelve aprox [-1, 1]. */
export function fbm3(x, y, z, octavas = 4, lacunaridad = 2, ganancia = 0.5) {
  let suma = 0;
  let amp = 1;
  let norma = 0;
  let f = 1;
  for (let i = 0; i < octavas; i++) {
    suma += noise3(x * f, y * f, z * f) * amp;
    norma += amp;
    amp *= ganancia;
    f *= lacunaridad;
  }
  return suma / norma;
}

export function smoothstep(borde0, borde1, x) {
  const t = Math.min(1, Math.max(0, (x - borde0) / (borde1 - borde0)));
  return t * t * (3 - 2 * t);
}

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const mezclar = (a, b, t) => a + (b - a) * t;

/** Mezcla dos colores RGB (arrays 0-255). */
export function mezclarColor(a, b, t) {
  return [mezclar(a[0], b[0], t), mezclar(a[1], b[1], t), mezclar(a[2], b[2], t)];
}

/* -------------------------- superelipsoide -------------------------- */

function radioSuper(dx, dy, dz, a, b, c, e1, e2) {
  const plano =
    Math.pow(Math.abs(dx / a), 2 / e2) + Math.pow(Math.abs(dz / c), 2 / e2);
  const F = Math.pow(plano, e2 / e1) + Math.pow(Math.abs(dy / b), 2 / e1);
  return Math.pow(F, -e1 / 2);
}

// Las 6 caras de un cubo mapeadas a direcciones. Muestrear un cubo y
// normalizar reparte los vértices mucho mejor que una esfera UV, que
// acumularía casi todo el detalle en los polos (justo donde una tabla o un
// bife son planos y no lo necesitan).
const CARAS = [
  (u, v) => [1, v, -u],
  (u, v) => [-1, v, u],
  (u, v) => [u, 1, v],
  (u, v) => [u, -1, -v],
  (u, v) => [-u, v, 1],
  (u, v) => [u, v, -1],
];

function normalesSuaves(posiciones, triangulos) {
  const normales = new Float32Array(posiciones.length);
  for (const [ia, ib, ic] of triangulos) {
    const ax = posiciones[ia * 3], ay = posiciones[ia * 3 + 1], az = posiciones[ia * 3 + 2];
    const bx = posiciones[ib * 3], by = posiciones[ib * 3 + 1], bz = posiciones[ib * 3 + 2];
    const cx = posiciones[ic * 3], cy = posiciones[ic * 3 + 1], cz = posiciones[ic * 3 + 2];
    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;
    for (const i of [ia, ib, ic]) {
      normales[i * 3] += nx;
      normales[i * 3 + 1] += ny;
      normales[i * 3 + 2] += nz;
    }
  }
  for (let i = 0; i < normales.length; i += 3) {
    const l = Math.hypot(normales[i], normales[i + 1], normales[i + 2]) || 1;
    normales[i] /= l;
    normales[i + 1] /= l;
    normales[i + 2] /= l;
  }
  return normales;
}

/**
 * Construye un sólido superelipsoidal cerrado.
 *
 * `desplazar(x, y, z, normal)` se aplica en una segunda pasada, sobre la
 * normal ya suavizada de la malla base — no sobre una normal analítica.
 * En una forma tipo losa (e1 chico) la normal del elipsoide equivalente
 * apunta bastante mal cerca de las caras planas, y desplazar por ahí
 * deforma la silueta en vez de darle relieve.
 */
export function construirSolido({ a, b, c, e1, e2, res, desplazar, uv = "planar" }) {
  const posiciones = [];
  const indicePorDireccion = new Map();
  const triangulos = [];
  const grillas = [];

  for (const cara of CARAS) {
    const grilla = [];
    for (let i = 0; i <= res; i++) {
      const fila = [];
      for (let j = 0; j <= res; j++) {
        const u = (i / res) * 2 - 1;
        const v = (j / res) * 2 - 1;
        let [dx, dy, dz] = cara(u, v);
        const largo = Math.hypot(dx, dy, dz);
        dx /= largo;
        dy /= largo;
        dz /= largo;

        const clave = `${Math.round(dx * 1e5)},${Math.round(dy * 1e5)},${Math.round(dz * 1e5)}`;
        let idx = indicePorDireccion.get(clave);
        if (idx === undefined) {
          const s = radioSuper(dx, dy, dz, a, b, c, e1, e2);
          idx = posiciones.length / 3;
          posiciones.push(dx * s, dy * s, dz * s);
          indicePorDireccion.set(clave, idx);
        }
        fila.push(idx);
      }
      grilla.push(fila);
    }
    grillas.push(grilla);
  }

  for (const grilla of grillas) {
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const A = grilla[i][j];
        const B = grilla[i + 1][j];
        const C = grilla[i + 1][j + 1];
        const D = grilla[i][j + 1];
        triangulos.push([A, B, C], [A, C, D]);
      }
    }
  }

  // El sólido es estrellado respecto del origen, así que el centroide de
  // cada triángulo sirve como referencia de "hacia afuera" para dejar todo
  // el winding consistente sin depender del orden de cada cara del cubo.
  for (const tri of triangulos) {
    const [ia, ib, ic] = tri;
    const ax = posiciones[ia * 3], ay = posiciones[ia * 3 + 1], az = posiciones[ia * 3 + 2];
    const bx = posiciones[ib * 3], by = posiciones[ib * 3 + 1], bz = posiciones[ib * 3 + 2];
    const cx = posiciones[ic * 3], cy = posiciones[ic * 3 + 1], cz = posiciones[ic * 3 + 2];
    const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
    const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (nx * (ax + bx + cx) + ny * (ay + by + cy) + nz * (az + bz + cz) < 0) {
      tri[1] = ic;
      tri[2] = ib;
    }
  }

  let pos = Float32Array.from(posiciones);
  let normales = normalesSuaves(pos, triangulos);

  if (desplazar) {
    const desplazadas = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      const d = desplazar(pos[i], pos[i + 1], pos[i + 2], [
        normales[i],
        normales[i + 1],
        normales[i + 2],
      ]);
      desplazadas[i] = pos[i] + normales[i] * d;
      desplazadas[i + 1] = pos[i + 1] + normales[i + 1] * d;
      desplazadas[i + 2] = pos[i + 2] + normales[i + 2] * d;
    }
    pos = desplazadas;
    normales = normalesSuaves(pos, triangulos);
  }

  let maxX = 1e-6;
  let maxY = 1e-6;
  let maxZ = 1e-6;
  for (let i = 0; i < pos.length; i += 3) {
    maxX = Math.max(maxX, Math.abs(pos[i]));
    maxY = Math.max(maxY, Math.abs(pos[i + 1]));
    maxZ = Math.max(maxZ, Math.abs(pos[i + 2]));
  }

  if (uv === "planar") {
    // Proyección desde arriba: la cara que más se mira queda sin distorsión
    // y el costado hereda un estirado vertical uniforme — invisible en una
    // costra tostada, desastroso en una veta de madera (ver modo "box").
    const uvs = new Float32Array((pos.length / 3) * 2);
    for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) {
      uvs[j] = 0.5 + pos[i] / (2 * maxX);
      uvs[j + 1] = 0.5 + pos[i + 2] / (2 * maxZ);
    }
    const indices = new Uint32Array(triangulos.length * 3);
    for (let t = 0; t < triangulos.length; t++) {
      indices[t * 3] = triangulos[t][0];
      indices[t * 3 + 1] = triangulos[t][1];
      indices[t * 3 + 2] = triangulos[t][2];
    }
    return { posiciones: pos, normales, uvs, indices };
  }

  // Proyección de caja: cada triángulo se proyecta sobre el plano al que
  // más mira. Obliga a desunir la malla (un vértice compartido por caras de
  // distinto eje necesita dos UV), pero es la única forma de que la veta de
  // una tabla siga la tabla en vez de escurrirse por los costados.
  //
  // Los tres ejes comparten una sola escala en espacio de mundo. Normalizar
  // cada eje por separado metía la textura completa dentro del canto de una
  // pieza fina, que es exactamente de dónde salían las franjas horizontales
  // que envolvían la tabla.
  const escala = Math.max(maxX, maxY, maxZ);
  const cantidad = triangulos.length * 3;
  const posB = new Float32Array(cantidad * 3);
  const norB = new Float32Array(cantidad * 3);
  const uvB = new Float32Array(cantidad * 2);
  const idxB = new Uint32Array(cantidad);

  for (let t = 0; t < triangulos.length; t++) {
    const tri = triangulos[t];
    const [ia, ib, ic] = tri;
    const ex1 = [pos[ib * 3] - pos[ia * 3], pos[ib * 3 + 1] - pos[ia * 3 + 1], pos[ib * 3 + 2] - pos[ia * 3 + 2]];
    const ex2 = [pos[ic * 3] - pos[ia * 3], pos[ic * 3 + 1] - pos[ia * 3 + 1], pos[ic * 3 + 2] - pos[ia * 3 + 2]];
    const fnx = Math.abs(ex1[1] * ex2[2] - ex1[2] * ex2[1]);
    const fny = Math.abs(ex1[2] * ex2[0] - ex1[0] * ex2[2]);
    const fnz = Math.abs(ex1[0] * ex2[1] - ex1[1] * ex2[0]);
    const eje = fny >= fnx && fny >= fnz ? 1 : fnx >= fnz ? 0 : 2;

    for (let k = 0; k < 3; k++) {
      const src = tri[k];
      const dst = t * 3 + k;
      const px = pos[src * 3];
      const py = pos[src * 3 + 1];
      const pz = pos[src * 3 + 2];
      posB[dst * 3] = px;
      posB[dst * 3 + 1] = py;
      posB[dst * 3 + 2] = pz;
      norB[dst * 3] = normales[src * 3];
      norB[dst * 3 + 1] = normales[src * 3 + 1];
      norB[dst * 3 + 2] = normales[src * 3 + 2];

      if (eje === 1) {
        uvB[dst * 2] = 0.5 + px / (2 * escala);
        uvB[dst * 2 + 1] = 0.5 + pz / (2 * escala);
      } else if (eje === 0) {
        uvB[dst * 2] = 0.5 + pz / (2 * escala);
        uvB[dst * 2 + 1] = 0.5 + py / (2 * escala);
      } else {
        uvB[dst * 2] = 0.5 + px / (2 * escala);
        uvB[dst * 2 + 1] = 0.5 + py / (2 * escala);
      }
      idxB[dst] = dst;
    }
  }

  return { posiciones: posB, normales: norB, uvs: uvB, indices: idxB };
}

/** Desplaza un sólido ya construido en Y (para apilar las capas). */
export function trasladarY(malla, dy) {
  for (let i = 1; i < malla.posiciones.length; i += 3) malla.posiciones[i] += dy;
  return malla;
}

/** Rango vertical real del sólido (ya desplazado), para apilar las capas. */
export function rangoY(malla) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 1; i < malla.posiciones.length; i += 3) {
    min = Math.min(min, malla.posiciones[i]);
    max = Math.max(max, malla.posiciones[i]);
  }
  return { min, max };
}

/**
 * Apoya un sólido sobre una superficie. `hundir` mete la pieza unos
 * milímetros dentro de la de abajo: sin eso queda una línea de luz entre
 * las capas que delata que son dos objetos flotando, no algo apoyado.
 */
export function apoyarSobre(malla, alturaSuperficie, hundir = 0) {
  const { min } = rangoY(malla);
  return trasladarY(malla, alturaSuperficie - hundir - min);
}
