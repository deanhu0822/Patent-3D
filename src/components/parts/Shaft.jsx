import { useRef, useState } from 'react';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

export function Shaft({ partRef, material = 'Steel', length = 6, radius = 0.3, position, rotation, scale, innerRef }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;
  const mat = mats[material] ?? mats['Steel'];

  const meshMat = mat.clone();
  if (isSelected) meshMat.emissive.set('#c4935a');
  else if (hovered) meshMat.emissive.set('#3a3a2a');
  meshMat.emissiveIntensity = isSelected ? 0.6 : hovered ? 0.3 : 0;

  return (
    <mesh
      ref={innerRef}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      material={meshMat}
      onClick={(e) => { e.stopPropagation(); setSelected(partRef); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <cylinderGeometry args={[radius, radius, length, 32]} />
    </mesh>
  );
}
