import { useState } from 'react';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

export function Pin({ partRef, material = 'Bronze', length = 0.5, radius = 0.08, position, rotation, scale }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;
  const mat = (mats[material] ?? mats['Bronze']).clone();
  if (isSelected) { mat.emissive.set('#c4935a'); mat.emissiveIntensity = 0.6; }
  else if (hovered) { mat.emissive.set('#3a3a2a'); mat.emissiveIntensity = 0.3; }

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      material={mat}
      onClick={(e) => { e.stopPropagation(); setSelected(partRef); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <cylinderGeometry args={[radius, radius, length, 16]} />
    </mesh>
  );
}
