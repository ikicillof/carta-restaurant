"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/Logo";
import restaurant from "@/data/restaurant.json";

export function Hero() {
  const seccionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contenidoRef = useRef<HTMLDivElement>(null);
  const indicadorRef = useRef<HTMLAnchorElement>(null);
  // El recorrido extra de scroll existe solo si la animación llegó a
  // armarse. Si el video no carga —red lenta, códec no soportado, archivo
  // caído— el hero se queda en una pantalla en vez de obligar a scrollear
  // tres por nada.
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const seccion = seccionRef.current;
    const video = videoRef.current;
    if (!seccion || !video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {}, seccion);

    const armar = () =>
      ctx.add(() => {
        // Una sola timeline para todo: así las proporciones entre lo que
        // dura el video y lo que tarda el texto en irse quedan explícitas,
        // en vez de repartidas entre triggers que hay que sincronizar a mano.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: seccion,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          indicadorRef.current,
          { autoAlpha: 0, ease: "none", duration: 0.08 },
          0,
        )
          // El texto se va antes de que el humo tape el cuadro: ese tramo del
          // clip es casi blanco y cualquier tipografía encima queda ilegible.
          .to(
            contenidoRef.current,
            { autoAlpha: 0, y: -48, ease: "none", duration: 0.28 },
            0,
          )
          .to(
            video,
            { currentTime: video.duration, ease: "none", duration: 1 },
            0,
          );

        setAnimado(true);
      });

    // iOS no deja hacer seek sobre un video que nunca se reprodujo. Este
    // play/pause inmediato lo destraba y no llega a verse.
    video
      .play()
      .then(() => video.pause())
      .catch(() => {});

    if (video.readyState >= 1) {
      armar();
    } else {
      video.addEventListener("loadedmetadata", armar, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", armar);
      ctx.revert();
    };
  }, []);

  // La sección cambia de alto recién cuando se arma la animación, así que
  // ScrollTrigger tiene que volver a medir: si no, conserva el start/end
  // calculado sobre la altura de una sola pantalla.
  useEffect(() => {
    if (animado) ScrollTrigger.refresh();
  }, [animado]);

  return (
    /*
      Con la animación armada el hero mide tres pantallas y su contenido
      queda `sticky` adentro. Es lo mismo que hace el `pin` de ScrollTrigger,
      pero nativo: el pin inserta un spacer que no se comporta bien cuando el
      elemento es hijo de un contenedor flex, como acá, y la página no crecía.
    */
    <section
      ref={seccionRef}
      id="inicio"
      className={`relative bg-carbon ${animado ? "h-[300vh]" : "h-dvh"}`}
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
        <video
          ref={videoRef}
          aria-hidden="true"
          muted
          playsInline
          preload="auto"
          poster="/videos/hero-poster.jpg"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        >
          <source src="/videos/hero.webm" type="video/webm" />
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

        <div
          ref={contenidoRef}
          className="relative flex flex-col items-center gap-6"
        >
          <Logo
            variant="full"
            className="h-16 w-auto text-hueso sm:h-20 md:h-24"
          />
          <p className="max-w-md text-balance font-display text-lg italic text-ceniza sm:text-xl">
            {restaurant.bajada}
          </p>
        </div>

        <a
          ref={indicadorRef}
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
      </div>

      <div id="hero-sentinel" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
