import { Logo } from "@/components/Logo";
import restaurant from "@/data/restaurant.json";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-carbon px-6 text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, color-mix(in srgb, var(--color-cobre) 22%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(40% 35% at 80% 85%, color-mix(in srgb, var(--color-brasa) 16%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <Logo
          variant="full"
          className="h-16 w-auto text-hueso sm:h-20 md:h-24"
        />
        <p className="max-w-md text-balance font-display text-lg italic text-ceniza sm:text-xl">
          {restaurant.bajada}
        </p>
      </div>

      <a
        href="#sobre-nosotros"
        aria-label="Bajar a la siguiente sección"
        className="absolute bottom-8 flex flex-col items-center gap-2 text-ceniza transition-colors hover:text-brasa motion-reduce:animate-none"
      >
        <span className="text-xs uppercase tracking-[0.25em]">Scroll</span>
        <svg
          width="18"
          height="28"
          viewBox="0 0 18 28"
          fill="none"
          className="animate-float motion-reduce:animate-none"
        >
          <rect
            x="1"
            y="1"
            width="16"
            height="26"
            rx="8"
            stroke="currentColor"
            strokeOpacity="0.5"
          />
          <circle cx="9" cy="9" r="2.5" fill="currentColor" />
        </svg>
      </a>

      <div id="hero-sentinel" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
