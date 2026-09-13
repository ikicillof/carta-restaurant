"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { PlatoModel } from "@/components/viewer/PlatoModel";
import { ErrorBoundary } from "@/components/viewer/ErrorBoundary";

interface ModelViewerCanvasProps {
  modelo: string | null;
  autoRotate: boolean;
  onFirstInteract: () => void;
  onModelReady: () => void;
}

export default function ModelViewerCanvas({
  modelo,
  autoRotate,
  onFirstInteract,
  onModelReady,
}: ModelViewerCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 1.35, 2.7], fov: 35 }}
    >
      {/*
        Luz base generosa a propósito: el Environment de abajo puede tardar
        o fallar (red del cliente, CDN caído), y sin IBL un material PBR se
        ve casi negro con luces tenues. Con esto el plato se ve bien incluso
        si el HDRI nunca llega.
      */}
      <ambientLight intensity={0.85} color="#fff4e6" />
      <directionalLight
        position={[2, 3, 2]}
        intensity={0.9}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-2, 1.5, -1.5]} intensity={0.35} color="#fff4e6" />

      {/*
        Boundaries separados a propósito: el modelo (o su primitiva
        placeholder, que no carga nada async) no debe quedar tapado por el
        HDRI del estudio si ese fetch es lento o falla. La luz ambiental +
        direccional de arriba ya deja el plato visible sin el Environment.
      */}
      <Suspense fallback={null}>
        <PlatoModel modelo={modelo} onReady={onModelReady} />
      </Suspense>

      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>
      </ErrorBoundary>

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.55}
        blur={2.4}
        scale={6}
        far={3}
        color="#000000"
      />

      <OrbitControls
        makeDefault
        target={[0, 0.55, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.7}
        maxDistance={3.6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        onStart={onFirstInteract}
      />
    </Canvas>
  );
}
