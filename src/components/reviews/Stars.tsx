interface StarsProps {
  calificacion: number;
  className?: string;
  tamano?: number;
}

function Star({ lleno, tamano }: { lleno: boolean; tamano: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={lleno ? "text-brasa" : "text-ceniza/30"}
    >
      <path
        d="M10 1.5l2.53 5.53 6.06.66-4.55 4.15 1.24 5.98L10 14.9l-5.28 2.92 1.24-5.98L1.41 7.7l6.06-.66L10 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Stars({ calificacion, className, tamano = 16 }: StarsProps) {
  const redondeada = Math.round(calificacion);
  return (
    <div
      role="img"
      aria-label={`${Math.round(calificacion * 10) / 10} de 5 estrellas`}
      className={`flex items-center gap-0.5 ${className ?? ""}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} lleno={i < redondeada} tamano={tamano} />
      ))}
    </div>
  );
}
