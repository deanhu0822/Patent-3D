import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

class HelixCurve extends THREE.Curve {
  constructor(radius, height, coils) {
    super();
    this.helixRadius = radius;
    this.helixHeight = height;
    this.coils = coils;
  }
  getPoint(t) {
    const angle = t * Math.PI * 2 * this.coils;
    return new THREE.Vector3(
      Math.cos(angle) * this.helixRadius,
      t * this.helixHeight - this.helixHeight / 2,
      Math.sin(angle) * this.helixRadius
    );
  }
}

export function Spring({ partRef, material = 'Spring Steel', coils = 8, height = 1.5, radius = 0.25, wireRadius = 0.04, position, rotation, scale }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;

  const geometry = useMemo(() => {
    const curve = new HelixCurve(radius, height, coils);
    return new THREE.TubeGeometry(curve, coils * 20, wireRadius, 8, false);
  }, [radius, height, coils, wireRadius]);

  const mat = (mats[material] ?? mats['Spring Steel']).clone();
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
