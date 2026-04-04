import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Shaft } from '../parts/Shaft';

export function WarpSystem({ explodeOffset = [0, 0, -6] }) {
  const visible = useStore((s) => s.visibleAssemblies['Warp System']);
  const groupRef = useExplode(explodeOffset);
  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 2.5, -2.8]}>
      {/* Warp beam C006 — large hardwood cylinder */}
      <Shaft partRef="C006" material="hardwood" length={9} radius={0.5} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} />
      {/* Warp beam shaft C008 — steel, runs through beam */}
      <Shaft partRef="C008" material="steel" length={10.5} radius={0.125} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} />
      {/* Bearings C026 — small discs at each end */}
      <mesh castShadow position={[-4.6, 0, 0]}>
        <torusGeometry args={[0.2, 0.07, 8, 24]} />
        <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[4.6, 0, 0]}>
        <torusGeometry args={[0.2, 0.07, 8, 24]} />
        <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}
