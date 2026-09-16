"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import restaurant from "@/data/restaurant.json";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Null hasta que hidrata. El video se monta solo en apaisado, así en el
  // celular no se bajan los 869KB del clip para nada.
  const [apaisado, setApaisado] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const leer = () => setApaisado(mq.matches);
    leer();
    mq.addEventListener("change", leer);
    return () => mq.removeEventListener("change", leer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Con movimiento reducido el clip queda en su primer cuadro, que ya es
    // una imagen del bife sobre la parrilla: el hero no pierde nada.
    video.pause();
    video.currentTime = 0;
  }, [apaisado]);

  return (
    <section
      id="inicio"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-carbon px-6 text-center"
    >
      {/*
        En vertical va el último cuadro del clip —el plato ya servido—
        recortado a proporción de celular. Un 16:9 en una pantalla vertical
        obliga a elegir entre recortarlo, encogerlo o rellenar los costados,
        y ninguna de las tres quedaba bien; como imagen fija el recorte es
        una decisión de encuadre normal. Además evita bajar el video.
      */}
      {apaisado !== true && (
        <Image
          src="/videos/hero-movil.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover"
        />
      )}

      {/*
        Sin `loop` a propósito: el clip cuenta crudo → parrilla → plato, y
        al terminar se queda en el plato servido. Repetirlo haría un corte
        seco del plato terminado de vuelta a la carne cruda.
      */}
      {apaisado === true && (
        <video
          ref={videoRef}
          src="/videos/hero.mp4"
          poster="/videos/hero-poster.jpg"
          aria-hidden="true"
          autoPlay
          muted
          playsInline
          preload="auto"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-carbon sm:h-56"
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
