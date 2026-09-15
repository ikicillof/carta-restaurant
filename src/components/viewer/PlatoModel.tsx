"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { getThemeColor } from "@/lib/theme-color";

// Decoder de Draco servido desde /public en vez del CDN de gstatic por
// default de drei: evita depender de un tercero para algo que va en el
// bundle estático del sitio.
useGLTF.setDecoderPath("/draco/");

const TAMANO_OBJETIVO = 1.5;

/**
 * Centra y reescala el modelo cargado para que ocupe siempre el mismo
 * volumen aproximado, sin importar la escala/pivote con la que Meshy haya
 * exportado el GLB. Así los límites de zoom de OrbitControls funcionan
 * igual para cualquier plato, sin ajustar distancias a mano por modelo.
 */
function useNormalizado(objeto: THREE.Object3D) {
  useEffect(() => {
    const caja = new THREE.Box3().setFromObject(objeto);
    const tamano = new THREE.Vector3();
    caja.getSize(tamano);
    const dimensionMayor = Math.max(tamano.x, tamano.y, tamano.z, 0.0001);
    const escala = TAMANO_OBJETIVO / dimensionMayor;

    const centro = new THREE.Vector3();
    caja.getCenter(centro);

    objeto.position.set(
      -centro.x * escala,
      -caja.min.y * escala,
      -centro.z * escala
    );
    objeto.scale.setScalar(escala);
  }, [objeto]);
}

function ModeloGltf({
  url,
  onReady,
}: {
  url: string;
  onReady?: () => void;
}) {
  const { scene } = useGLTF(url);
  const clon = useMemo(() => scene.clone(true), [scene]);
  useNormalizado(clon);

  // castShadow/receiveShadow en el <primitive> no bajan a las mallas del
  // GLTF: hay que recorrerlo. Sin esto las capas del plato no se proyectan
  // sombra entre sí y el apilado se ve como calcomanías superpuestas.
  useEffect(() => {
    clon.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [clon]);

  // Suspense recién monta este componente cuando useGLTF ya resolvió,
  // así que este efecto marca "listo" exactamente en ese momento.
  useEffect(() => onReady?.(), [onReady]);
  return <primitive object={clon} />;
}

function ModeloPlaceholder({ onReady }: { onReady?: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const color = useMemo(
    () => getThemeColor("--color-hueso", "#f2ede6"),
    []
  );
  // No hay nada async que esperar: queda "listo" apenas monta.
  useEffect(() => onReady?.(), [onReady]);

  return (
    <group ref={ref} position={[0, 0.12, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.22, 48]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.16, 48]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.08} />
      </mesh>
    </group>
  );
}

interface PlatoModelProps {
  modelo: string | null;
  onReady?: () => void;
}

export function PlatoModel({ modelo, onReady }: PlatoModelProps) {
  if (!modelo) return <ModeloPlaceholder onReady={onReady} />;
  return <ModeloGltf url={modelo} onReady={onReady} />;
}
