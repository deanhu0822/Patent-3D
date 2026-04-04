import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Lever } from '../parts/Lever';
import { Pin } from '../parts/Pin';
import { Housing } from '../parts/Housing';

export function ControlLeverMechanism({ explodeOffset = [0, -3, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Control Lever Mechanism']);
  const groupRef = useExplode(explodeOffset);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, -2.5, 0]}>
      {/* Left control lever (ref 14) — two-armed */}
      <Lever partRef="14" length={1.8} width={0.22} thickness={0.1} arms={2} position={[-1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Right control lever (ref 14) */}
      <Lever partRef="14" length={1.8} width={0.22} thickness={0.1} arms={2} position={[1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Bearing pins (ref 12) */}
      <Pin partRef="12" length={0.7} radius={0.1} position={[-1.5, 0, 0]} rotation={[0, 0, 0]} />
      <Pin partRef="12" length={0.7} radius={0.1} position={[1.5, 0, 0]} rotation={[0, 0, 0]} />

      {/* Articulated joint (ref 21) — small connector */}
      <Housing partRef="21" width={0.25} height={0.25} depth={0.25} position={[0, 0.2, 0]} />

      {/* Connecting bar (ref 23) — horizontal */}
      <Lever partRef="23" length={3.2} width={0.18} thickness={0.08} arms={1} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} />
    </group>
  );
}
