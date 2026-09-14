interface AvatarProps {
  iniciales: string;
  color: "cobre" | "brasa" | "ceniza";
}

// bg-cobre-chip (no bg-cobre): el cobre de marca da 4.1:1 con texto carbon
// encima, por debajo del piso AA de 4.5:1. La variante aclarada en
// globals.css resuelve el contraste sin tocar el cobre de marca en el
// resto del sitio.
const BG: Record<AvatarProps["color"], string> = {
  cobre: "bg-cobre-chip",
  brasa: "bg-brasa",
  ceniza: "bg-ceniza",
};

export function Avatar({ iniciales, color }: AvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-carbon ${BG[color]}`}
    >
      {iniciales}
    </div>
  );
}
