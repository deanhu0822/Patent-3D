import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Shaft } from '../parts/Shaft';

export function ClothTakeupSystem({ explodeOffset = [0, 0, 6] }) {
  const visible = useStore((s) => s.visibleAssemblies['Cloth Takeup System']);
  const groupRef = useExplode(explodeOffset);
  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0.5, 2.8]}>
      {/* Cloth beam C007 — slightly smaller hardwood cylinder */}
      <Shaft partRef="C007" material="hardwood" length={9} radius={0.375} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} />
      {/* Cloth beam shaft C009 */}
      <Shaft partRef="C009" material="steel" length={10.5} radius={0.1} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} />
      {/* Bearings C026 */}
      <mesh castShadow position={[-4.6, 0, 0]}>
        <torusGeometry args={[0.16, 0.06, 8, 24]} />
        <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[4.6, 0, 0]}>
        <torusGeometry args={[0.16, 0.06, 8, 24]} />
        <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}
