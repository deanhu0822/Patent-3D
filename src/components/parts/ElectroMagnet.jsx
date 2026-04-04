import { useState } from 'react';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

export function ElectroMagnet({ partRef, width = 1.2, height = 0.8, depth = 0.6, position, rotation, scale }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;

  const housingMat = mats['Cast Iron'].clone();
  const coreMat = mats['Iron Core'].clone();
  const coilMat = mats['Copper Wire'].clone();

  if (isSelected) {
    [housingMat, coreMat, coilMat].forEach((m) => { m.emissive.set('#c4935a'); m.emissiveIntensity = 0.5; });
  } else if (hovered) {
    [housingMat, coreMat, coilMat].forEach((m) => { m.emissive.set('#3a3a2a'); m.emissiveIntensity = 0.3; });
  }

  const handlers = {
    onClick: (e) => { e.stopPropagation(); setSelected(partRef); },
    onPointerOver: (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; },
    onPointerOut: () => { setHovered(false); document.body.style.cursor = 'auto'; },
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Housing */}
      <mesh castShadow material={housingMat} {...handlers}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>
      {/* Iron core */}
      <mesh castShadow material={coreMat} position={[0, 0, 0]} {...handlers}>
        <cylinderGeometry args={[height * 0.18, height * 0.18, depth * 0.8, 16]} />
      </mesh>
      {/* Coil wrapping */}
      <mesh castShadow material={coilMat} {...handlers}>
        <torusGeometry args={[height * 0.25, height * 0.07, 10, 32]} />
      </mesh>
    </group>
  );
}
