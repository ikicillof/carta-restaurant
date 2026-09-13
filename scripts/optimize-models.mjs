#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "public", "models", "raw");
const OUT_DIR = path.join(ROOT, "public", "models");
const BUDGET_BYTES = 3 * 1024 * 1024;
const GLTF_TRANSFORM_BIN = path.join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "gltf-transform.cmd" : "gltf-transform"
);

const useKtx2 = process.argv.includes("--ktx2");
const textureCompress = useKtx2 ? "ktx2" : "webp";

function tieneKtxCli() {
  try {
    execFileSync("command", ["-v", "ktx"], { shell: "/bin/bash" });
    return true;
  } catch {
    return false;
  }
}

if (useKtx2 && !tieneKtxCli()) {
  console.error(
    "Pediste --ktx2 pero no se encontró el binario `ktx` en el PATH.\n" +
      "Instalá KTX-Software (https://github.com/KhronosGroup/KTX-Software/releases) " +
      "o corré el script sin --ktx2 para comprimir texturas con WebP (no necesita nada extra)."
  );
  process.exit(1);
}

mkdirSync(RAW_DIR, { recursive: true });

const archivos = existsSync(RAW_DIR)
  ? readdirSync(RAW_DIR).filter((f) => /\.(glb|gltf)$/i.test(f))
  : [];

if (archivos.length === 0) {
  console.log(
    `No hay modelos en public/models/raw/. Poné ahí los .glb exportados de Meshy y volvé a correr "npm run optimize:models".`
  );
  process.exit(0);
}

console.log(
  `Optimizando ${archivos.length} modelo(s) con --compress draco --texture-compress ${textureCompress}\n`
);

let huboSobrepresupuesto = false;

for (const archivo of archivos) {
  const entrada = path.join(RAW_DIR, archivo);
  const nombreSalida = archivo.replace(/\.gltf$/i, ".glb");
  const salida = path.join(OUT_DIR, nombreSalida);

  console.log(`→ ${archivo}`);
  execFileSync(
    GLTF_TRANSFORM_BIN,
    [
      "optimize",
      entrada,
      salida,
      "--compress",
      "draco",
      "--texture-compress",
      textureCompress,
    ],
    { stdio: "inherit" }
  );

  const bytes = statSync(salida).size;
  const mb = (bytes / (1024 * 1024)).toFixed(2);

  if (bytes > BUDGET_BYTES) {
    huboSobrepresupuesto = true;
    console.warn(`  ⚠ ${nombreSalida} pesa ${mb}MB — por encima del presupuesto de 3MB.\n`);
  } else {
    console.log(`  ✔ ${nombreSalida}: ${mb}MB\n`);
  }
}

if (huboSobrepresupuesto) {
  console.warn(
    "Algún modelo superó el presupuesto de 3MB. Probá reducir el detalle en Meshy antes de exportar, " +
      "o correr con --ktx2 si tenés KTX-Software instalado (comprime más que WebP)."
  );
}
