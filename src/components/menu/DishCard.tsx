import Image from "next/image";
import type { Plato, TagPlato } from "@/data/types";
import { formatPrecio } from "@/lib/format";

const TAG_LABELS: Record<TagPlato, string> = {
  vegetariano: "Vegetariano",
  "sin-tacc": "Sin TACC",
  picante: "Picante",
  "para-compartir": "Para compartir",
  destacado: "Destacado",
};

interface DishCardProps {
  plato: Plato;
}

export function DishCard({ plato }: DishCardProps) {
  const tagsSecundarios = plato.tags.filter((t) => t !== "destacado");
  const esDestacado = plato.tags.includes("destacado");

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-hueso/10 bg-grafito">
      <div className="relative aspect-[4/3] w-full bg-carbon">
        <Image
          src={plato.imagen}
          alt={`${plato.nombre}, imagen ilustrativa`}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
        {esDestacado && (
          <span className="absolute left-3 top-3 rounded-full bg-brasa px-2.5 py-1 text-[11px] font-medium text-carbon">
            Destacado
          </span>
        )}
        {plato.modelo && (
          <button
            type="button"
            className="absolute bottom-3 right-3 rounded-full bg-carbon/80 px-3 py-1.5 text-xs font-medium text-hueso backdrop-blur transition-colors hover:bg-carbon"
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
                className="rounded-full border border-ceniza/30 px-2.5 py-1 text-[11px] text-ceniza"
              >
                {TAG_LABELS[tag]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
