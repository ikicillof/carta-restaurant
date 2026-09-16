"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import restaurant from "@/data/restaurant.json";

const APAISADO = {
  video: "/videos/hero.mp4",
  poster: "/videos/hero-poster.jpg",
};

const VERTICAL = {
  video: "/videos/hero-vertical.mp4",
  poster: "/videos/hero-vertical-poster.jpg",
};

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // La fuente se resuelve en el cliente para que se baje un solo archivo, el
  // que corresponde a la orientación. Hasta entonces el elemento no tiene
  // src y lo que se ve es el póster.
  const [clip, setClip] = useState<typeof APAISADO | null>(null);

  useEffect(() => {
    const vertical = window.matchMedia("(orientation: portrait)");
    const elegir = () => setClip(vertical.matches ? VERTICAL : APAISADO);
    elegir();
    vertical.addEventListener("change", elegir);
    return () => vertical.removeEventListener("change", elegir);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Con movimiento reducido el clip queda en su primer cuadro, que ya es
    // una imagen del bife sobre la parrilla: el hero no pierde nada.
    video.pause();
    video.currentTime = 0;
  }, [clip]);

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
      {/*
        Hay una versión por orientación. La vertical no recorta el 16:9: lo
        deja entero al ancho de la pantalla y completa arriba y abajo con una
        copia ampliada y desenfocada del mismo cuadro, así llena el celular
        sin perder nada de la imagen.
      */}
      <video
        key={clip?.video}
        ref={videoRef}
        src={clip?.video}
        poster={clip?.poster}
        aria-hidden="true"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

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

      {/*
        El borde de abajo se disuelve en el `carbon` de la sección siguiente,
        para que el hero no termine en una línea recta contra el resto.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-carbon sm:h-56"
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
