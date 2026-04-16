import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Shaft } from '../parts/Shaft';

export function BeatupMechanism({ explodeOffset = [0, 2, 4] }) {
  const visible = useStore((s) => s.visibleAssemblies['Beat-up Mechanism']);
  const animating = useStore((s) => s.animating);
  const groupRef = useExplode(explodeOffset);
  const beaterRef = useRef();

  useFrame(({ clock }) => {
    if (!animating || !beaterRef.current) return;
    // Swing forward ~20° and back
    beaterRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 2) * 0.35 - 0.1;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0.5, 1.6]}>
      {/* Pivot shaft C018 — runs full width at bottom of beater */}
      <Shaft partRef="C018" material="steel" length={10} radius={0.1}
        rotation={[0, 0, Math.PI / 2]} position={[0, -1.8, 0]} />

      {/* Beater frame C016 — pivots about shaft */}
      <group ref={beaterRef} position={[0, -1.8, 0]}>
        {/* Left & right uprights */}
        {[-4.6, 4.6].map((x, i) => (
          <mesh key={i} castShadow
            userData={{ partRef: 'C016' }}
            onClick={(e) => { e.stopPropagation(); useStore.getState().setSelected('C016'); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <boxGeometry args={[0.15, 2.8, 0.18]} />
            <meshStandardMaterial color="#8b6343" metalness={0} roughness={0.9} />
          </mesh>
        ))}

        {/* Reed C017 — comb represented as thin flat panel with lines */}
        <mesh castShadow position={[0, 1.1, 0]}
          userData={{ partRef: 'C017' }}
          onClick={(e) => { e.stopPropagation(); useStore.getState().setSelected('C017'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[9, 0.6, 0.05]} />
          <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Top bar of beater */}
        <mesh castShadow position={[0, 1.42, 0]}>
          <boxGeometry args={[9.5, 0.1, 0.2]} />
          <meshStandardMaterial color="#8b6343" metalness={0} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
