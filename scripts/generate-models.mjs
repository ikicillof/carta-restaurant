#!/usr/bin/env node
/**
 * Generador procedural de los modelos 3D de la carta.
 *
 * Cada plato se arma por capas apiladas (base de pizarra → tabla o plato →
 * la comida), cada una como un sólido superelipsoidal con relieve propio.
 * La comida además lleva desplazamiento con ruido para que la silueta sea
 * irregular, y texturas PBR horneadas acá mismo (color + normal + ORM) para
 * que el relieve se lea al rotar.
 *
 * Salida: public/models/raw/<id>.glb — después pasa por
 * `npm run optimize:models` como cualquier otro modelo.
 */

import { Document, NodeIO } from "@gltf-transform/core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  construirSolido,
  apoyarSobre,
  rangoY,
  fbm3,
  smoothstep,
  clamp,
  mezclar,
  mezclarColor,
} from "./lib/procedural.mjs";
import {
  hornearColor,
  hornearNormal,
  hornearORM,
  paletaDeFoto,
} from "./lib/texturas.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "public", "models", "raw");
const FOTOS_DIR = path.join(ROOT, "public", "images", "platos");

const TEX_COMIDA = 1024;
const TEX_TABLA = 512;

/* ------------------------- capas de presentación ------------------------- */

// Bordes muy marcados (e1/e2 chicos): una tabla de parrilla es una pieza
// aserrada, no un almohadón. Con exponentes altos quedaba blanda y leía
// como un brownie.
const BASE = { a: 1.08, b: 0.05, c: 0.78, e1: 0.09, e2: 0.13, res: 16 };
const TABLA = { a: 0.94, b: 0.058, c: 0.63, e1: 0.1, e2: 0.16, res: 22 };

const COLOR_PIZARRA = [0x15 / 255, 0x12 / 255, 0x11 / 255, 1];

function texturaMadera(u, v, pal) {
  // Madera de parrilla (algarrobo/quebracho): marrón cálido medio. La foto
  // solo la matiza — si la dejo mandar, el tono se va al marrón oscuro de
  // la carne y la tabla deja de leerse como una capa distinta.
  const clara = mezclarColor([141, 100, 60], pal.medio, 0.16);
  const oscura = mezclarColor([70, 42, 22], pal.sombra, 0.18);

  // Anillos de crecimiento: líneas oscuras finas sobre madera clara, con
  // espaciado irregular. La versión anterior usaba |sin|, que deja la línea
  // marcada justo en el cruce por cero — o sea la veta salía en negativo,
  // como un corrugado de rayas claras.
  const warp = fbm3(u * 1.6, v * 2.2, 0.7, 3) * 0.55;
  const t = v * 4.2 + warp + fbm3(u * 0.7, v * 0.7, 3.3, 2) * 0.8;
  const ciclo = t - Math.floor(t);
  const anillo = Math.pow(Math.max(0, 1 - Math.abs(ciclo - 0.5) * 3.4), 2.4);

  let color = mezclarColor(clara, oscura, anillo * 0.8);

  // Estrías finas que corren a lo largo de la tabla, casi sin contraste.
  const fibra = fbm3(u * 55, v * 2.2, 2.2, 2) * 0.5 + 0.5;
  color = mezclarColor(color, oscura, fibra * 0.1);

  const tono = fbm3(u * 1.1, v * 1.4, 8.8, 3) * 0.5 + 0.5;
  color = mezclarColor(color, clara, tono * 0.18);

  const nudo = smoothstep(0.8, 0.97, fbm3(u * 3.2, v * 3.2, 7.4, 3) * 0.5 + 0.5);
  color = mezclarColor(color, oscura, nudo * 0.55);

  return { color, anillo, nudo };
}

function alturaMadera(u, v, pal) {
  const { anillo, nudo } = texturaMadera(u, v, pal);
  return -anillo * 0.35 - nudo * 0.4 + fbm3(u * 90, v * 2.5, 4.1, 2) * 0.08;
}

/* ------------------------------ el bife ------------------------------ */

const BIFE = { a: 0.8, b: 0.165, c: 0.42, e1: 0.3, e2: 0.72, res: 40 };

function desplazarBife(x, y, z, normal) {
  let d = 0;
  // Irregularidad del contorno: ruido en función del ángulo, para que la
  // silueta vista desde arriba no sea el óvalo perfecto del superelipsoide.
  const ang = Math.atan2(z, x);
  const horizontalidad = Math.hypot(normal[0], normal[2]);
  d += fbm3(Math.cos(ang) * 2.4, 0.5, Math.sin(ang) * 2.4, 3) * 0.06 * horizontalidad;
  // Bultos grandes: ningún corte es simétrico.
  d += fbm3(x * 1.7, y * 1.7, z * 1.7, 3) * 0.04;
  // Contracción de la fibra por el fuego.
  d += fbm3(x * 5.5, y * 5.5, z * 5.5, 3) * 0.016;
  d += fbm3(x * 16, y * 16, z * 16, 2) * 0.005;
  // Tapa de grasa: banda apenas saliente sobre uno de los lados largos.
  d += smoothstep(0.58, 0.95, z / BIFE.c) * 0.03;
  // El lomo se abomba al cocinarse y la cara de abajo se aplana contra la
  // parrilla.
  d += smoothstep(0.15, 0.95, y / BIFE.b) * 0.012;
  d -= smoothstep(-0.5, -0.95, y / BIFE.b) * 0.016;
  return d;
}

function camposBife(u, v) {
  // Contorno del sólido en espacio UV: mismo exponente que el superelipsoide.
  const n = 2 / BIFE.e2;
  const cx = (u - 0.5) * 2;
  const cy = (v - 0.5) * 2;
  const d = Math.pow(Math.pow(Math.abs(cx), n) + Math.pow(Math.abs(cy), n), 1 / n);

  // Marcas de parrilla: finas y bastante juntas. Con bandas anchas el corte
  // parecía un pan rayado en vez de carne marcada sobre hierro.
  const ang = 0.34;
  const s = (u - 0.5) * Math.cos(ang) + (v - 0.5) * Math.sin(ang);
  const onda = Math.sin(s * Math.PI * 2 * 7 + fbm3(u * 3, v * 3, 5.1, 2) * 0.7);
  const marca = smoothstep(0.72, 0.96, onda) * smoothstep(1.0, 0.7, d);

  // La costra solo manda cerca del contorno: es la zona que el UV planar
  // estira sobre el canto, y ahí conviene un tono parejo.
  const costra = smoothstep(0.76, 0.99, d);
  const tapa = smoothstep(0.88, 0.97, v) * (0.55 + 0.45 * (fbm3(u * 14, 3.7, v * 5, 2) * 0.5 + 0.5));

  // Fibra muscular (ruido estirado en un eje) + moteado fino del sellado.
  const fibra = fbm3(u * 6, v * 22, 1.7, 3) * 0.5 + 0.5;
  const moteado = fbm3(u * 48, v * 48, 11.3, 3) * 0.5 + 0.5;
  const veta = clamp(fibra * 0.6 + moteado * 0.4, 0, 1);

  return { d, marca, costra, tapa, veta, moteado };
}

function colorBife(u, v, pal) {
  const { marca, costra, tapa, veta, moteado } = camposBife(u, v);

  // Paleta de carne sellada, apenas corrida hacia los tonos de la foto real
  // del plato. El peso de la foto es bajo a propósito: con más, todo se iba
  // a un marrón plano y el bife dejaba de distinguirse de la tabla.
  const carneClara = mezclarColor([164, 100, 56], pal.luz, 0.18);
  const carneMedia = mezclarColor([128, 71, 38], pal.medio, 0.2);
  const carneOscura = mezclarColor([99, 52, 27], pal.sombra, 0.18);
  const carbonizado = mezclarColor([31, 18, 12], pal.sombra, 0.25);
  const costraColor = mezclarColor([86, 46, 23], pal.sombra, 0.14);
  const grasaColor = mezclarColor([198, 156, 98], pal.luz, 0.22);

  // Tres tonos en vez de dos: el jaspeado de la carne tiene zonas claras
  // donde la grasa se fundió, y sin eso la superficie lee como un plano.
  let color =
    veta < 0.5
      ? mezclarColor(carneOscura, carneMedia, veta * 2)
      : mezclarColor(carneMedia, carneClara, (veta - 0.5) * 2);

  // Pecas de carbón del contacto con el hierro.
  color = mezclarColor(color, carbonizado, smoothstep(0.78, 0.93, moteado) * 0.45);

  color = mezclarColor(color, carbonizado, marca * 0.88);
  color = mezclarColor(color, costraColor, costra * 0.9);
  color = mezclarColor(color, grasaColor, tapa * 0.45);
  return color;
}

function alturaBife(u, v) {
  const { marca, costra, tapa, veta, moteado } = camposBife(u, v);
  let h = (veta - 0.5) * 0.35 + (moteado - 0.5) * 0.25;
  h -= marca * 0.6;
  h += tapa * 0.25;
  h -= costra * 0.12;
  return h;
}

function ormBife(u, v) {
  const { marca, costra, tapa } = camposBife(u, v);
  let rugosidad = 0.56;
  rugosidad = mezclar(rugosidad, 0.88, marca);
  rugosidad = mezclar(rugosidad, 0.34, tapa);
  rugosidad = mezclar(rugosidad, 0.74, costra);
  const ao = 1 - marca * 0.32 - costra * 0.14;
  return { ao, rugosidad, metalico: 0 };
}

/* --------------------------- armado del glTF --------------------------- */

function agregarMalla(doc, buffer, malla, material, nombre) {
  const prim = doc
    .createPrimitive()
    .setAttribute(
      "POSITION",
      doc.createAccessor().setArray(malla.posiciones).setType("VEC3").setBuffer(buffer)
    )
    .setAttribute(
      "NORMAL",
      doc.createAccessor().setArray(malla.normales).setType("VEC3").setBuffer(buffer)
    )
    .setAttribute(
      "TEXCOORD_0",
      doc.createAccessor().setArray(malla.uvs).setType("VEC2").setBuffer(buffer)
    )
    .setIndices(
      doc.createAccessor().setArray(malla.indices).setType("SCALAR").setBuffer(buffer)
    )
    .setMaterial(material);

  return doc.createNode(nombre).setMesh(doc.createMesh(nombre).addPrimitive(prim));
}

// DUMP_TEX=<dir> vuelca cada mapa horneado como PNG. Mirar la textura
// plana es la única forma rápida de distinguir un bug de horneado de uno
// de mapeo UV cuando algo se ve raro sobre el modelo.
const DUMP_TEX = process.env.DUMP_TEX;

function textura(doc, nombre, png) {
  if (DUMP_TEX) {
    fs.mkdirSync(DUMP_TEX, { recursive: true });
    fs.writeFileSync(path.join(DUMP_TEX, `${nombre}.png`), png);
  }
  return doc.createTexture(nombre).setImage(png).setMimeType("image/png");
}

async function generarBife(dishId) {
  const pal = await paletaDeFoto(path.join(FOTOS_DIR, `${dishId}.jpg`));

  const doc = new Document();
  const buffer = doc.createBuffer();
  const escena = doc.createScene("Escena");
  const raiz = doc.createNode(dishId);
  escena.addChild(raiz);

  /* --- capa 1: base de pizarra --- */
  const base = apoyarSobre(construirSolido({ ...BASE, uv: "box" }), 0);
  const matBase = doc
    .createMaterial("Pizarra")
    .setBaseColorFactor(COLOR_PIZARRA)
    .setRoughnessFactor(0.92)
    .setMetallicFactor(0.02);
  raiz.addChild(agregarMalla(doc, buffer, base, matBase, "Base"));

  /* --- capa 2: tabla de madera --- */
  const tabla = apoyarSobre(construirSolido({ ...TABLA, uv: "box" }), rangoY(base).max, 0.006);
  const matTabla = doc
    .createMaterial("Tabla")
    .setBaseColorTexture(
      textura(doc, "tabla-color", await hornearColor(TEX_TABLA, (u, v) => texturaMadera(u, v, pal).color))
    )
    .setNormalTexture(
      textura(doc, "tabla-normal", await hornearNormal(TEX_TABLA, (u, v) => alturaMadera(u, v, pal), 0.8))
    )
    .setRoughnessFactor(0.82)
    .setMetallicFactor(0);
  raiz.addChild(agregarMalla(doc, buffer, tabla, matTabla, "Tabla"));

  /* --- capa 3: el bife --- */
  const bife = apoyarSobre(
    construirSolido({ ...BIFE, desplazar: desplazarBife }),
    rangoY(tabla).max,
    0.012
  );

  const ormTex = textura(
    doc,
    "bife-orm",
    await hornearORM(TEX_COMIDA, (u, v) => ormBife(u, v))
  );
  const matBife = doc
    .createMaterial("Bife")
    .setBaseColorTexture(
      textura(doc, "bife-color", await hornearColor(TEX_COMIDA, (u, v) => colorBife(u, v, pal)))
    )
    .setNormalTexture(
      textura(doc, "bife-normal", await hornearNormal(TEX_COMIDA, (u, v) => alturaBife(u, v), 2.6))
    )
    .setMetallicRoughnessTexture(ormTex)
    .setOcclusionTexture(ormTex)
    .setRoughnessFactor(1)
    .setMetallicFactor(0);
  raiz.addChild(agregarMalla(doc, buffer, bife, matBife, "Bife"));

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const salida = path.join(RAW_DIR, `${dishId}.glb`);
  await new NodeIO().write(salida, doc);
  return salida;
}

/* --------------------------------- main --------------------------------- */

const RECETAS = {
  "bife-de-chorizo": generarBife,
  "ojo-de-bife-madurado": generarBife,
  "entrana-fina": generarBife,
};

const pedidos = process.argv.slice(2);
const aGenerar = pedidos.length > 0 ? pedidos : Object.keys(RECETAS);

for (const id of aGenerar) {
  const receta = RECETAS[id];
  if (!receta) {
    console.error(`✗ ${id}: no hay receta definida. Disponibles: ${Object.keys(RECETAS).join(", ")}`);
    process.exitCode = 1;
    continue;
  }
  const salida = await receta(id);
  const kb = (fs.statSync(salida).size / 1024).toFixed(0);
  console.log(`✔ ${id}.glb generado (${kb} KB sin optimizar)`);
}
