import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

export function Disc({ partRef, material = 'Hardened Steel', radius = 1.2, thickness = 0.3, eccentric = false, slots = 0, position, rotation, scale }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;

  const geometry = useMemo(() => {
    // Build outer disc as extruded shape
    const shape = new THREE.Shape();
    shape.absarc(eccentric ? 0.2 : 0, 0, radius, 0, Math.PI * 2, false);

    // Cut center hole
    const holePath = new THREE.Path();
    holePath.absarc(eccentric ? 0.2 : 0, 0, radius * 0.15, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    // Add slot grooves if requested
    if (slots > 0) {
      for (let i = 0; i < slots; i++) {
        const angle = (i / slots) * Math.PI * 2;
        const slotPath = new THREE.Path();
        const cx = Math.cos(angle) * radius * 0.7;
        const cy = Math.sin(angle) * radius * 0.7;
        slotPath.moveTo(cx - 0.05, cy - 0.2);
        slotPath.lineTo(cx + 0.05, cy - 0.2);
        slotPath.lineTo(cx + 0.05, cy + 0.2);
        slotPath.lineTo(cx - 0.05, cy + 0.2);
        slotPath.closePath();
        shape.holes.push(slotPath);
      }
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 2,
    });
  }, [radius, thickness, eccentric, slots]);

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
