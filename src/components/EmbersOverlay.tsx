"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const CONSULTA_REDUCIDO = "(prefers-reduced-motion: reduce)";

function suscribirReducido(avisar: () => void) {
  const mq = window.matchMedia(CONSULTA_REDUCIDO);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}

const COLORES = ["#FF6B1A", "#FFA033", "#FFD27A"];

/** Fracción del hero visible por debajo de la cual el overlay aparece. */
const UMBRAL_HERO = 0.2;

/** Techo de la turbulencia: un scroll violento no debe descontrolar las brasas. */
const TURBULENCIA_MAX = 1;

/** Cuánto scroll (px por frame) hace falta para llegar a turbulencia máxima. */
const SCROLL_PARA_MAXIMO = 45;

/** Fuerza del jitter que la turbulencia suma a la velocidad. */
const DISPERSION = 0.55;

/** El glow de cada brasa mide este múltiplo de su radio. */
const ESCALA_GLOW = 4;

const SPRITE_PX = 64;

interface Brasa {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Velocidad de reposo: tras una ráfaga, la brasa vuelve gradualmente a esto. */
  vxBase: number;
  vyBase: number;
  radio: number;
  vida: number;
  vidaMax: number;
  opacidad: number;
  fase: number;
  amplitud: number;
  color: number;
}

function reciclar(b: Brasa, ancho: number, alto: number, inicial: boolean) {
  b.x = Math.random() * ancho;
  // Al arrancar se reparten por toda la pantalla; después entran por abajo.
  b.y = inicial ? Math.random() * alto : alto + Math.random() * 40;
  b.radio = 0.8 + Math.random() * 1.6;
  b.vyBase = -(0.15 + Math.random() * 0.45);
  b.vxBase = (Math.random() - 0.5) * 0.08;
  b.vx = b.vxBase;
  b.vy = b.vyBase;
  b.vida = inicial ? Math.random() * 400 : 0;
  b.vidaMax = 600 + Math.random() * 900;
  b.opacidad = 0.35 + Math.random() * 0.45;
  b.fase = Math.random() * Math.PI * 2;
  b.amplitud = 0.12 + Math.random() * 0.35;
  b.color = Math.floor(Math.random() * COLORES.length);
}

/**
 * Cada color se pre-renderiza una vez a un canvas propio. Dibujar ese sprite
 * escalado es lo que da el glow sin crear un gradiente por brasa por frame,
 * que sería una allocation en cada vuelta del loop.
 */
function crearSprite(color: string) {
  const c = document.createElement("canvas");
  c.width = SPRITE_PX;
  c.height = SPRITE_PX;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = SPRITE_PX / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(0.3, `${color}99`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  // fillRect acá es sobre el sprite offscreen, no sobre el canvas visible.
  g.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
  return c;
}

export function EmbersOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // En el servidor siempre false, así el marcado inicial coincide; si el
  // usuario pide movimiento reducido, el cliente lo corrige al hidratar.
  const reducido = useSyncExternalStore(
    suscribirReducido,
    () => window.matchMedia(CONSULTA_REDUCIDO).matches,
    () => false,
  );

  useEffect(() => {
    if (reducido) return;
    const elemento = canvasRef.current;
    if (!elemento) return;
    const contexto = elemento.getContext("2d");
    if (!contexto) return;
    // Rebind a constantes ya no nulas: TypeScript no conserva el estrechamiento
    // dentro de las funciones declaradas más abajo.
    const canvas = elemento;
    const ctx = contexto;

    const sprites = COLORES.map(crearSprite);

    let ancho = 0;
    let alto = 0;
    let brasas: Brasa[] = [];
    let raf = 0;
    let ultimoTiempo = 0;
    let tiempo = 0;
    let scrollActual = window.scrollY;
    let ultimoScroll = scrollActual;
    let turbulencia = 0;
    let opacidad = 0;
    let objetivoOpacidad = 1;
    let timeoutResize: ReturnType<typeof setTimeout> | undefined;

    const cantidad = () => (window.innerWidth < 768 ? 25 : 70);

    function dimensionar() {
      // El DPR se limita a 2: en pantallas 3x el costo se triplica sin que la
      // diferencia se note en partículas difusas de dos píxeles.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = window.innerWidth;
      alto = window.innerHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const objetivo = cantidad();
      if (brasas.length !== objetivo) {
        brasas = Array.from({ length: objetivo }, () => {
          const b = {} as Brasa;
          reciclar(b, ancho, alto, true);
          return b;
        });
      }
    }

    dimensionar();

    function alRedimensionar() {
      clearTimeout(timeoutResize);
      timeoutResize = setTimeout(dimensionar, 150);
    }

    function alScrollear() {
      // El handler solo anota la posición. La velocidad se deriva una vez por
      // frame dentro del rAF: así no se hace trabajo proporcional a la
      // cantidad de eventos, y se lee `scrollY` una sola vez por scroll en
      // lugar de forzar layout en cada frame.
      scrollActual = window.scrollY;
    }

    function frame(ahora: number) {
      raf = requestAnimationFrame(frame);
      if (ultimoTiempo === 0) ultimoTiempo = ahora;
      const bruto = ahora - ultimoTiempo;
      ultimoTiempo = ahora;
      tiempo += bruto;
      // Normalizado a frames de 60fps y con techo, para que una pestaña que
      // vuelve del fondo no dispare un salto enorme.
      const dt = Math.min(bruto / 16.667, 3);

      const recorrido = Math.abs(scrollActual - ultimoScroll);
      ultimoScroll = scrollActual;
      const objetivoTurb = Math.min(
        recorrido / SCROLL_PARA_MAXIMO,
        TURBULENCIA_MAX,
      );
      turbulencia =
        objetivoTurb > turbulencia
          ? turbulencia + (objetivoTurb - turbulencia) * 0.35
          : turbulencia * 0.92;

      opacidad += (objetivoOpacidad - opacidad) * 0.06 * dt;

      ctx.clearRect(0, 0, ancho, alto);

      for (let i = 0; i < brasas.length; i++) {
        const b = brasas[i];

        const deriva = Math.sin(tiempo * 0.0012 + b.fase) * b.amplitud;
        b.x += (b.vx + deriva) * dt;
        b.y += b.vy * dt;

        if (turbulencia > 0.001) {
          const f = turbulencia * DISPERSION * dt;
          b.vx += (Math.random() - 0.5) * f;
          b.vy += (Math.random() - 0.5) * f;
        }
        // Retorno a la subida calma cuando la ráfaga pasa.
        b.vx += (b.vxBase - b.vx) * 0.02 * dt;
        b.vy += (b.vyBase - b.vy) * 0.02 * dt;

        b.vida += dt;
        if (b.vida >= b.vidaMax || b.y < -20) {
          reciclar(b, ancho, alto, false);
          continue;
        }
        if (b.x < -20) b.x = ancho + 20;
        else if (b.x > ancho + 20) b.x = -20;
      }

      if (opacidad < 0.01) return;

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < brasas.length; i++) {
        const b = brasas[i];
        const t = b.vida / b.vidaMax;
        // Nunca aparecen ni desaparecen de golpe.
        const fade = t < 0.15 ? t / 0.15 : t > 0.75 ? (1 - t) / 0.25 : 1;
        const alpha = b.opacidad * fade * opacidad;
        if (alpha <= 0.002) continue;

        const lado = b.radio * ESCALA_GLOW * 2;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprites[b.color],
          b.x - lado / 2,
          b.y - lado / 2,
          lado,
          lado,
        );
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function arrancar() {
      if (raf) return;
      ultimoTiempo = 0;
      scrollActual = window.scrollY;
      ultimoScroll = scrollActual;
      raf = requestAnimationFrame(frame);
    }

    function detener() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function alCambiarVisibilidad() {
      if (document.hidden) detener();
      else arrancar();
    }

    // El overlay no se ve encima del hero: ahí ya hay brasas y humo reales.
    const hero = document.querySelector("[data-embers-exclude]");
    const observer = hero
      ? new IntersectionObserver(
          ([entrada]) => {
            objetivoOpacidad = entrada.intersectionRatio > UMBRAL_HERO ? 0 : 1;
          },
          { threshold: [0, UMBRAL_HERO, 0.5, 1] },
        )
      : null;
    if (hero && observer) observer.observe(hero);

    window.addEventListener("resize", alRedimensionar);
    window.addEventListener("scroll", alScrollear, { passive: true });
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    arrancar();

    return () => {
      detener();
      clearTimeout(timeoutResize);
      window.removeEventListener("resize", alRedimensionar);
      window.removeEventListener("scroll", alScrollear);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      observer?.disconnect();
    };
  }, [reducido]);

  if (reducido) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
}
