import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Shaft } from '../parts/Shaft';
import { Lever } from '../parts/Lever';

export function TreadleSystem({ explodeOffset = [0, -5, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Treadle System']);
  const groupRef = useExplode(explodeOffset);
  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, -2.5, 1.5]}>
      {/* Treadle pivot rod C020 — horizontal */}
      <Shaft partRef="C020" material="steel" length={4} radius={0.075}
        rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} />

      {/* 4 treadles C019 — foot pedals */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <Lever key={i} partRef="C019" material="hardwood"
          length={3} width={0.4} thickness={0.1} arms={1}
          position={[x, -0.6, 0.8]}
          rotation={[Math.PI / 2, 0, -0.25]}
        />
      ))}

      {/* 4 lams C021 — connecting bars, vertical linkages */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <Lever key={i} partRef="C021" material="hardwood"
          length={2.5} width={0.2} thickness={0.075} arms={1}
          position={[x, 1.0, -0.4]}
          rotation={[0.3, 0, 0]}
        />
      ))}
    </group>
  );
}
