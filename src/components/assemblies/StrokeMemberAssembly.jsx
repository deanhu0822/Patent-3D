import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Lever } from '../parts/Lever';
import { Pin } from '../parts/Pin';
import { Spring } from '../parts/Spring';

export function StrokeMemberAssembly({ explodeOffset = [4, 0, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Stroke Member Assembly']);
  const groupRef = useExplode(explodeOffset);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[2.8, -1.2, 0]}>
      {/* Three-armed stroke member — arms 31, 32, 33 */}
      <Lever partRef="31" length={1.6} width={0.2} thickness={0.1} arms={3} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Overload levers (ref 41) — pair */}
      <Lever partRef="41" length={1.2} width={0.18} thickness={0.09} arms={2} position={[-0.6, 0.8, 0.3]} rotation={[Math.PI / 2, 0, 0.3]} />
      <Lever partRef="41" length={1.2} width={0.18} thickness={0.09} arms={2} position={[0.6, 0.8, 0.3]} rotation={[Math.PI / 2, 0, -0.3]} />

      {/* Bias spring (ref 37) */}
      <Spring partRef="37" coils={7} height={1.1} radius={0.15} wireRadius={0.03} position={[0, -1.0, 0]} />

      {/* Drive lever (ref 48) */}
      <Lever partRef="48" length={1.8} width={0.22} thickness={0.1} arms={1} position={[0, 0.6, 0.4]} rotation={[Math.PI / 2, 0, 0.6]} />

      {/* Mount pin */}
      <Pin partRef="35" length={0.6} radius={0.1} position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </group>
  );
}
