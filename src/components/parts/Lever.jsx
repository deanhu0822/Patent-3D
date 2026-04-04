import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useMaterials } from '../materials/useMaterials';
import { useStore } from '../../store';

function buildLeverShape(length, width, thickness, arms) {
  const shapes = [];

  if (arms === 1 || arms === 2) {
    // Single or two-armed: simple bar
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hl = length / 2;
    shape.moveTo(-hl, -hw);
    shape.lineTo(hl, -hw);
    shape.lineTo(hl, hw);
    shape.lineTo(-hl, hw);
    shape.closePath();
    shapes.push(shape);

    if (arms === 2) {
      const shape2 = new THREE.Shape();
      shape2.moveTo(-hw, -hl);
      shape2.lineTo(hw, -hl);
      shape2.lineTo(hw, 0);
      shape2.lineTo(-hw, 0);
      shape2.closePath();
      shapes.push(shape2);
    }
  } else {
    // Three-armed: hub + 3 arms at 120°
    const hub = new THREE.Shape();
    hub.absarc(0, 0, width * 0.8, 0, Math.PI * 2, false);
    shapes.push(hub);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const ax = Math.cos(angle) * length / 2;
      const ay = Math.sin(angle) * length / 2;
      const perp = angle + Math.PI / 2;
      const px = Math.cos(perp) * width / 2;
      const py = Math.sin(perp) * width / 2;

      const arm = new THREE.Shape();
      arm.moveTo(px, py);
      arm.lineTo(ax + px, ay + py);
      arm.lineTo(ax - px, ay - py);
      arm.lineTo(-px, -py);
      arm.closePath();
      shapes.push(arm);
    }
  }
  return shapes;
}

export function Lever({ partRef, material = 'Steel', length = 2, width = 0.25, thickness = 0.1, arms = 1, position, rotation, scale }) {
  const mats = useMaterials();
  const selectedRef = useStore((s) => s.selectedRef);
  const setSelected = useStore((s) => s.setSelected);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRef === partRef;

  const geometry = useMemo(() => {
    const shapes = buildLeverShape(length, width, thickness, arms);
    const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 };

    if (shapes.length === 1) {
      return new THREE.ExtrudeGeometry(shapes[0], extrudeSettings);
    }
    // Merge multiple shapes
    const geoms = shapes.map((s) => new THREE.ExtrudeGeometry(s, extrudeSettings));
    const merged = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    for (const g of geoms) {
      const pos = g.attributes.position.array;
      const nor = g.attributes.normal.array;
      const uv = g.attributes.uv.array;
      positions.push(...pos);
      normals.push(...nor);
      uvs.push(...uv);
    }
    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return merged;
  }, [length, width, thickness, arms]);

  const mat = (mats[material] ?? mats['Steel']).clone();
  if (isSelected) { mat.emissive.set('#c4935a'); mat.emissiveIntensity = 0.6; }
  else if (hovered) { mat.emissive.set('#3a3a2a'); mat.emissiveIntensity = 0.3; }

  return (
    <mesh
      geometry={geometry}
      material={mat}
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
