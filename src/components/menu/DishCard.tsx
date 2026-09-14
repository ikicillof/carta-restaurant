"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Plato } from "@/data/types";
import { formatPrecio } from "@/lib/format";
import { TAG_LABELS } from "@/lib/tags";
import { supportsHover } from "@/lib/webgl";

// Dinámico y sin SSR: three.js/R3F/drei no deben entrar en el bundle
// inicial, solo cargan cuando alguien realmente abre el visor 3D.
const DishModal = dynamic(
  () => import("@/components/viewer/DishModal").then((m) => m.DishModal),
  { ssr: false }
);

interface DishCardProps {
  plato: Plato;
}

export function DishCard({ plato }: DishCardProps) {
  const [visorAbierto, setVisorAbierto] = useState(false);
  const tagsSecundarios = plato.tags.filter((t) => t !== "destacado");
  const esDestacado = plato.tags.includes("destacado");

  function precargarModelo() {
    const modelo = plato.modelo;
    if (!modelo || !supportsHover()) return;
    // Import dinámico: mantiene drei fuera del bundle principal y solo
    // trae la librería (y el GLB) cuando el mouse pasa por la card.
    import("@react-three/drei").then(({ useGLTF }) => useGLTF.preload(modelo));
  }

  return (
    <article className="flex flex-col overflow-hidden border border-hueso/10 bg-grafito">
      <div
        className="relative aspect-[4/3] w-full bg-carbon"
        onMouseEnter={precargarModelo}
      >
        <Image
          src={plato.imagen}
          alt={`${plato.nombre}, imagen ilustrativa`}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
        {esDestacado && (
          <span className="absolute left-3 top-3 rounded-[2px] bg-brasa px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-carbon">
            Destacado
          </span>
        )}
        {plato.modelo && (
          <button
            type="button"
            onClick={() => setVisorAbierto(true)}
            className="absolute bottom-3 right-3 rounded-[2px] bg-carbon/80 px-3 py-1.5 text-xs font-medium text-hueso backdrop-blur transition-colors hover:bg-carbon"
          >
            Ver en 3D
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-lg leading-snug text-hueso">
            {plato.nombre}
          </h4>
          <span className="shrink-0 whitespace-nowrap font-display text-lg text-brasa">
            {formatPrecio(plato.precio)}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-ceniza">
          {plato.descripcion}
        </p>

        {tagsSecundarios.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {tagsSecundarios.map((tag) => (
              <li
                key={tag}
                className="rounded-[2px] border border-ceniza/30 px-2.5 py-1 text-xs text-ceniza"
              >
                {TAG_LABELS[tag]}
              </li>
            ))}
          </ul>
        )}
      </div>

      {visorAbierto && (
        <DishModal plato={plato} onClose={() => setVisorAbierto(false)} />
      )}
    </article>
  );
}
