import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Housing } from '../parts/Housing';
import { Shaft } from '../parts/Shaft';
import { Disc } from '../parts/Disc';

// Represents one heddle frame — a thin aluminium rectangle
function HeddleFrame({ partRef, position, innerRef }) {
  const setSelected = useStore((s) => s.setSelected);
  const selectedRef = useStore((s) => s.selectedRef);
  const isSelected = selectedRef === partRef;
  return (
    <group ref={innerRef} position={position}>
      {/* Frame border — 4 thin bars */}
      {[[-4.15, 0, 0], [4.15, 0, 0]].map((pos, i) => (
        <mesh key={i} castShadow position={pos}
          onClick={(e) => { e.stopPropagation(); setSelected(partRef); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[0.1, 2, 0.06]} />
          <meshStandardMaterial color="#c8cdd4" metalness={0.8} roughness={0.3}
            emissive={isSelected ? '#c4935a' : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} />
        </mesh>
      ))}
      {[[-0, 0.95, 0], [0, -0.95, 0]].map((pos, i) => (
        <mesh key={i + 2} castShadow position={pos}
          onClick={(e) => { e.stopPropagation(); setSelected(partRef); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[8.4, 0.1, 0.06]} />
          <meshStandardMaterial color="#c8cdd4" metalness={0.8} roughness={0.3}
            emissive={isSelected ? '#c4935a' : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} />
        </mesh>
      ))}
      {/* Heddle wires — represented as a semi-transparent panel */}
      <mesh castShadow
        onClick={(e) => { e.stopPropagation(); setSelected('C011'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[8.2, 1.78, 0.01]} />
        <meshStandardMaterial color="#606870" metalness={0.9} roughness={0.2} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export function SheddingMechanism({ explodeOffset = [0, 4, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Shedding Mechanism']);
  const animating = useStore((s) => s.animating);
  const groupRef = useExplode(explodeOffset);

  const frame0Ref = useRef();
  const frame1Ref = useRef();
  const frame2Ref = useRef();
  const frame3Ref = useRef();
  const camRef = useRef();

  useFrame(({ clock }) => {
    if (!animating) return;
    const t = clock.getElapsedTime();
    const amp = 0.6;
    if (frame0Ref.current) frame0Ref.current.position.y =  Math.sin(t * 2) * amp;
    if (frame1Ref.current) frame1Ref.current.position.y = -Math.sin(t * 2) * amp;
    if (frame2Ref.current) frame2Ref.current.position.y =  Math.sin(t * 2 + 1) * amp;
    if (frame3Ref.current) frame3Ref.current.position.y = -Math.sin(t * 2 + 1) * amp;
    if (camRef.current) camRef.current.rotation.z = t * 2;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 1.5, -0.4]}>
      {/* 4 heddle frames spaced along Z */}
      <HeddleFrame partRef="C010" position={[0, 0, -1.2]} innerRef={frame0Ref} />
      <HeddleFrame partRef="C010" position={[0, 0, -0.4]} innerRef={frame1Ref} />
      <HeddleFrame partRef="C010" position={[0, 0,  0.4]} innerRef={frame2Ref} />
      <HeddleFrame partRef="C010" position={[0, 0,  1.2]} innerRef={frame3Ref} />

      {/* Guide rods C012 — vertical pins at frame corners */}
      {[-4, 4].map((x, i) => (
        <Shaft key={i} partRef="C012" material="steel" length={3} radius={0.06}
          position={[x, 0, 0]} />
      ))}

      {/* Camshaft C023 */}
      <Shaft partRef="C023" material="steel" length={2.5} radius={0.11}
        position={[0, -2.2, 0]} rotation={[0, 0, Math.PI / 2]} />

      {/* 4 cams C022 */}
      <group ref={camRef} position={[0, -2.2, 0]}>
        {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
          <Disc key={i} partRef="C022" material="steel" radius={0.38} thickness={0.1}
            eccentric position={[x, 0, 0]} rotation={[Math.PI / 2, 0, (i * Math.PI) / 2]} />
        ))}
      </group>
    </group>
  );
}
