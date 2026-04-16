import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

export function Pawl({ partRef, material = 'Hardened Steel', length = 1.4, width = 0.25, thickness = 0.12, position, rotation, scale }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hl = length / 2;

    // Main body
    shape.moveTo(-hl, -hw);
    shape.lineTo(hl * 0.5, -hw);
    // Nose / tooth protrusion at the end
    shape.lineTo(hl * 0.5, -hw * 1.8);
    shape.lineTo(hl, -hw * 0.5);
    shape.lineTo(hl, hw);
    shape.lineTo(-hl, hw);
    shape.closePath();

    // Pivot hole
    const pivot = new THREE.Path();
    pivot.absarc(-hl * 0.6, 0, hw * 0.5, 0, Math.PI * 2, true);
    shape.holes.push(pivot);

    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
      bevelSegments: 2,
    });
  }, [length, width, thickness]);

  const mat = (mats[material] ?? mats['Hardened Steel']).clone();
  if (isSelected) { mat.emissive.set('#c4935a'); mat.emissiveIntensity = 0.6; }
  else if (hovered) { mat.emissive.set('#3a3a2a'); mat.emissiveIntensity = 0.3; }

  return (
    <mesh
      geometry={geometry}
      material={mat}
      userData={{ partRef }}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      onClick={(e) => { e.stopPropagation(); setSelected(partRef); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    />
  );
}
