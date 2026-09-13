interface AvatarProps {
  iniciales: string;
  color: "cobre" | "brasa" | "ceniza";
}

const BG: Record<AvatarProps["color"], string> = {
  cobre: "bg-cobre",
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
