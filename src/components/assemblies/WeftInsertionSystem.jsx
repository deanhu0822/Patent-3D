import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Housing } from '../parts/Housing';
import { Shaft } from '../parts/Shaft';

export function WeftInsertionSystem({ explodeOffset = [-6, 0, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Weft Insertion System']);
  const animating = useStore((s) => s.animating);
  const groupRef = useExplode(explodeOffset);
  const shuttleRef = useRef();

  useFrame(({ clock }) => {
    if (!animating || !shuttleRef.current) return;
    shuttleRef.current.position.x = Math.sin(clock.getElapsedTime() * 1.5) * 3.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      {/* Shuttle race C015 — long flat track */}
      <Housing partRef="C015" material="hardwood" width={10} height={0.2} depth={0.3} position={[0, -0.3, 0]} />

      {/* Shuttle C013 — boat-shaped box */}
      <group ref={shuttleRef}>
        <mesh castShadow
          onClick={(e) => { e.stopPropagation(); useStore.getState().setSelected('C013'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[2, 0.175, 0.25]} />
          <meshStandardMaterial color="#8b6343" metalness={0} roughness={0.9} />
        </mesh>
        {/* Bobbin C014 inside shuttle */}
        <Shaft partRef="C014" material="plastic" length={0.75} radius={0.065}
          rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} />
      </group>
    </group>
  );
}
