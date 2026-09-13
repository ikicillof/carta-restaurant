"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Plato } from "@/data/types";
import { formatPrecio } from "@/lib/format";
import { TAG_LABELS } from "@/lib/tags";
import { isWebglAvailable, prefersReducedMotion } from "@/lib/webgl";
import { ErrorBoundary } from "@/components/viewer/ErrorBoundary";
import { ViewerLoader } from "@/components/viewer/ViewerLoader";
import { DragHint } from "@/components/viewer/DragHint";
import { ViewerFallback } from "@/components/viewer/ViewerFallback";

const ModelViewerCanvas = dynamic(
  () => import("@/components/viewer/ModelViewerCanvas"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-visor" />,
  }
);

const SELECTOR_FOCEABLES =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface DishModalProps {
  plato: Plato;
  onClose: () => void;
}

export function DishModal({ plato, onClose }: DishModalProps) {
  const [webglOk] = useState(isWebglAvailable);
  const [autoRotate, setAutoRotate] = useState(() => !prefersReducedMotion());
  const [showHint, setShowHint] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [modeloListo, setModeloListo] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const elementoPrevio = useRef<HTMLElement | null>(null);

  useEffect(() => {
    elementoPrevio.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowPrevio;
      elementoPrevio.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onClose();
        return;
      }

      if (evento.key !== "Tab" || !dialogRef.current) return;

      const focoables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(SELECTOR_FOCEABLES)
      ).filter((el) => el.offsetParent !== null);
      if (focoables.length === 0) return;

      const primero = focoables[0];
      const ultimo = focoables[focoables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onClose]);

  useEffect(() => {
    if (!webglOk || errorCarga || !modeloListo) return;
    const temporizador = setTimeout(() => setShowHint(true), 800);
    return () => clearTimeout(temporizador);
  }, [webglOk, errorCarga, modeloListo]);

  function alPrimerInteractuar() {
    setAutoRotate(false);
    setShowHint(false);
  }

  const tagsSecundarios = plato.tags.filter((t) => t !== "destacado");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/80 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visor-titulo"
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-grafito sm:h-[min(82vh,640px)] sm:max-w-3xl sm:flex-row sm:rounded-3xl"
      >
        <div className="relative aspect-square w-full shrink-0 bg-visor sm:aspect-auto sm:h-full sm:w-3/5">
          {!webglOk ? (
            <ViewerFallback
              plato={plato}
              mensaje="Tu navegador no soporta la vista 3D. Te dejamos la foto del plato."
            />
          ) : (
            <ErrorBoundary
              onError={() => setErrorCarga(true)}
              fallback={
                <ViewerFallback
                  plato={plato}
                  mensaje="No pudimos cargar el modelo 3D. Te dejamos la foto del plato."
                />
              }
            >
              <ModelViewerCanvas
                modelo={plato.modelo}
                autoRotate={autoRotate}
                onFirstInteract={alPrimerInteractuar}
                onModelReady={() => setModeloListo(true)}
              />
              <ViewerLoader visible={!modeloListo} />
              <DragHint visible={showHint} />
            </ErrorBoundary>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 rounded-full bg-carbon/70 p-2 text-hueso backdrop-blur transition-colors hover:bg-carbon"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 2L14 14M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <h3 id="visor-titulo" className="font-display text-2xl text-hueso">
            {plato.nombre}
          </h3>
          <p className="font-display text-xl text-brasa">
            {formatPrecio(plato.precio)}
          </p>
          <p className="text-sm leading-relaxed text-ceniza">
            {plato.descripcion}
          </p>

          {tagsSecundarios.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {tagsSecundarios.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-ceniza/30 px-2.5 py-1 text-[11px] text-ceniza"
                >
                  {TAG_LABELS[tag]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
