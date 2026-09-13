"use client";

import { useProgress } from "@react-three/drei";

interface ViewerLoaderProps {
  visible: boolean;
}

export function ViewerLoader({ visible }: ViewerLoaderProps) {
  // El progreso es informativo (viene del loading manager global de three.js,
  // que también cuenta el HDRI del entorno); la visibilidad la decide el
  // padre según si el plato en sí ya está listo, para no quedar tapado por
  // un asset secundario lento.
  const { progress } = useProgress();

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-visor"
      role="status"
      aria-live="polite"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-carbon/15 border-t-cobre motion-reduce:animate-none" />
      <span className="text-sm font-medium text-carbon/70">
        Cargando modelo… {Math.round(progress)}%
      </span>
    </div>
  );
}
