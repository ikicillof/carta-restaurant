/**
 * Horneado de texturas PBR procedurales.
 *
 * Cada material se define con dos funciones sobre (u, v): una que devuelve
 * color y otra que devuelve altura. El normal map sale de derivar esa
 * altura con Sobel, así el relieve (marcas de parrilla, veta de la madera)
 * coincide exactamente con lo que se ve en el color, que es lo que hace que
 * la superficie lea como volumen y no como una calcomanía.
 */

import sharp from "sharp";
import { clamp } from "./procedural.mjs";

const b255 = (x) => Math.round(clamp(x, 0, 255));

/** Hornea un mapa de color RGB. `fn(u, v)` devuelve [r, g, b] en 0-255. */
export async function hornearColor(size, fn) {
  const buf = Buffer.allocUnsafe(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fn((x + 0.5) / size, (y + 0.5) / size);
      const o = (y * size + x) * 3;
      buf[o] = b255(r);
      buf[o + 1] = b255(g);
      buf[o + 2] = b255(b);
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } })
    .png()
    .toBuffer();
}

/**
 * Hornea el normal map tangente a partir de un campo de alturas.
 *
 * Convención OpenGL (+Y hacia arriba), que es la que espera glTF.
 */
export async function hornearNormal(size, alturaFn, fuerza = 2.4) {
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      h[y * size + x] = alturaFn((x + 0.5) / size, (y + 0.5) / size);
    }
  }

  const at = (x, y) =>
    h[((y % size) + size) % size * size + (((x % size) + size) % size)];

  const buf = Buffer.allocUnsafe(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx =
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
      const gy =
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));

      let nx = -gx * fuerza;
      let ny = gy * fuerza;
      let nz = 1;
      const l = Math.hypot(nx, ny, nz) || 1;
      nx /= l;
      ny /= l;
      nz /= l;

      const o = (y * size + x) * 3;
      buf[o] = b255((nx * 0.5 + 0.5) * 255);
      buf[o + 1] = b255((ny * 0.5 + 0.5) * 255);
      buf[o + 2] = b255((nz * 0.5 + 0.5) * 255);
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } })
    .png()
    .toBuffer();
}

/**
 * Hornea el mapa ORM que espera glTF en `metallicRoughnessTexture`:
 * R = oclusión, G = rugosidad, B = metalicidad.
 */
export async function hornearORM(size, fn) {
  const buf = Buffer.allocUnsafe(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const { ao = 1, rugosidad, metalico = 0 } = fn(
        (x + 0.5) / size,
        (y + 0.5) / size
      );
      const o = (y * size + x) * 3;
      buf[o] = b255(ao * 255);
      buf[o + 1] = b255(rugosidad * 255);
      buf[o + 2] = b255(metalico * 255);
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels: 3 } })
    .png()
    .toBuffer();
}

/**
 * Saca una paleta representativa de la foto real del plato, para que el
 * modelo procedural no quede con colores inventados que no peguen con la
 * carta. Devuelve percentiles de luminancia: sombra, medio y luz.
 */
export async function paletaDeFoto(rutaFoto) {
  const { data } = await sharp(rutaFoto)
    .resize(32, 32, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixeles = [];
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    pixeles.push({ r, g, b, lum: 0.2126 * r + 0.7152 * g + 0.0722 * b });
  }
  pixeles.sort((a, b) => a.lum - b.lum);

  const enPercentil = (p) => {
    const i = clamp(Math.round(p * (pixeles.length - 1)), 0, pixeles.length - 1);
    const px = pixeles[i];
    return [px.r, px.g, px.b];
  };

  return {
    sombra: enPercentil(0.12),
    medio: enPercentil(0.5),
    luz: enPercentil(0.88),
  };
}
