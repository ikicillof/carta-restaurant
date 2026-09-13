import Image from "next/image";
import type { Plato } from "@/data/types";

interface ViewerFallbackProps {
  plato: Plato;
  mensaje: string;
}

export function ViewerFallback({ plato, mensaje }: ViewerFallbackProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-visor p-6 text-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-carbon/10">
        <Image
          src={plato.imagen}
          alt={`${plato.nombre}, imagen ilustrativa`}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <p className="max-w-xs text-sm text-carbon/70">{mensaje}</p>
    </div>
  );
}
