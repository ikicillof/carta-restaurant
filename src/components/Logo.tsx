interface LogoProps {
  variant?: "full" | "compact" | "glyph";
  className?: string;
}

function Glyph() {
  return (
    <>
      <defs>
        <linearGradient id="rescoldo-glyph-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-cobre)" />
          <stop offset="100%" stopColor="var(--color-brasa)" />
        </linearGradient>
      </defs>
      <path
        d="M10 28 A14 14 0 1 1 30 28"
        fill="none"
        stroke="url(#rescoldo-glyph-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="30" cy="13" r="3" fill="var(--color-brasa)" />
    </>
  );
}

/**
 * Logotipo Rescoldo en SVG inline. El glifo (arco de brasa + chispa) es fijo
 * a la paleta de marca vía tokens de Tailwind (var(--color-*)); el wordmark
 * usa currentColor para heredar el color de texto del contexto donde se use.
 */
export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "glyph") {
    return (
      <svg
        viewBox="0 0 40 40"
        className={className}
        role="img"
        aria-label="Rescoldo"
      >
        <Glyph />
      </svg>
    );
  }

  if (variant === "compact") {
    return (
      <svg
        viewBox="0 0 168 40"
        className={className}
        role="img"
        aria-label="Rescoldo"
      >
        <Glyph />
        <text
          x="48"
          y="28"
          fontFamily="var(--font-display)"
          fontSize="26"
          fontWeight={500}
          letterSpacing="0.3"
          fill="currentColor"
        >
          Rescoldo
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 300 64"
      className={className}
      role="img"
      aria-label="Rescoldo"
    >
      <g transform="translate(0 12)">
        <Glyph />
      </g>
      <text
        x="52"
        y="44"
        fontFamily="var(--font-display)"
        fontSize="40"
        fontWeight={500}
        letterSpacing="0.3"
        fill="currentColor"
      >
        Rescoldo
      </text>
    </svg>
  );
}
