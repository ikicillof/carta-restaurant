"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
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
      camera={{ position: [0, 1.75, 2.4], fov: 35 }}
    >
      <ambientLight intensity={0.34} color="#fff4e6" />
      {/*
        Frustum de sombra ajustado al modelo: el default cubre 10×10 unidades
        y el plato mide 1.5, así que la sombra caía en un puñado de téxeles y
        no se leía el contacto entre las capas.
      */}
      <directionalLight
        position={[2.2, 3.4, 2]}
        intensity={2.4}
        color="#fff2e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-1.6}
        shadow-camera-right={1.6}
        shadow-camera-top={1.6}
        shadow-camera-bottom={-1.6}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-2.4, 1.6, -1.8]} intensity={0.85} color="#c98f5a" />

      <Suspense fallback={null}>
        <PlatoModel modelo={modelo} onReady={onModelReady} />
      </Suspense>

      {/*
        Estudio armado con Lightformers en vez de `preset`: los presets de
        drei bajan un HDRI de un CDN externo, y de eso dependía que un
        material PBR se viera como algo más que una mancha oscura. Modelado
        acá, el reflejo especular no depende de la red de nadie — y además
        las luces siguen la paleta cálida de la marca.
      */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <Environment resolution={256}>
            {/*
              Intensidades bajas a propósito: el IBL no se ocluye, así que
              subirlo tapa por completo la sombra proyectada y el bife deja
              de apoyarse sobre la tabla. Acá el entorno aporta el reflejo
              especular y la direccional hace de luz principal.
            */}
            <Lightformer
              intensity={1.1}
              position={[0, 4, 1.5]}
              scale={[8, 4, 1]}
              color="#fff6ea"
            />
            <Lightformer
              intensity={0.55}
              position={[-3.5, 1.5, 2]}
              scale={[4, 4, 1]}
              color="#e8a33d"
            />
            <Lightformer
              intensity={0.4}
              position={[3.5, 1, -2.5]}
              scale={[4, 4, 1]}
              color="#b65c2e"
            />
          </Environment>
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
        target={[0, 0.16, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={4.2}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        onStart={onFirstInteract}
      />
    </Canvas>
  );
}
