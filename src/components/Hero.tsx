"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import restaurant from "@/data/restaurant.json";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Con movimiento reducido el clip queda en su primer cuadro, que ya es
    // una imagen del bife sobre la parrilla: el hero no pierde nada.
    video.pause();
    video.currentTime = 0;
  }, []);

  return (
    <section
      id="inicio"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-carbon px-6 text-center"
    >
      {/*
        Sin `loop` a propósito: el clip cuenta crudo → parrilla → plato, y
        al terminar se queda en el plato servido. Repetirlo haría un corte
        seco del plato terminado de vuelta a la carne cruda.
      */}
      <video
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/videos/hero-poster.jpg"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/*
        Velo sobre el video: el tramo de humo del clip es casi blanco y sin
        esto el hueso del logo desaparece encima.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-carbon/65"
      />

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
        <Logo variant="full" className="h-16 w-auto text-hueso sm:h-20 md:h-24" />
        <p className="max-w-md text-balance font-display text-lg italic text-ceniza sm:text-xl">
          {restaurant.bajada}
        </p>
      </div>

      <div id="hero-sentinel" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
