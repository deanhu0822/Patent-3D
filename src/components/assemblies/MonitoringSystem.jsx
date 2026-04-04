import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Lever } from '../parts/Lever';
import { Housing } from '../parts/Housing';
import { Spring } from '../parts/Spring';
import { Disc } from '../parts/Disc';
import { Pin } from '../parts/Pin';

export function MonitoringSystem({ explodeOffset = [4, 3, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Monitoring System']);
  const groupRef = useExplode(explodeOffset);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[3.2, 1.2, 0]}>
      {/* Three-armed lever pair (refs 73, 78) */}
      <Lever partRef="73" length={1.4} width={0.2} thickness={0.1} arms={3} position={[-0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Lever partRef="78" length={1.4} width={0.2} thickness={0.1} arms={3} position={[0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0.5]} />

      {/* Vane (ref 82) — thin plate on arm */}
      <mesh castShadow position={[0.8, 0.9, 0.1]}>
        <boxGeometry args={[0.5, 0.12, 0.04]} />
        <meshStandardMaterial color="#5a6070" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Proximity switch housing (ref 83) */}
      <Housing partRef="83" width={0.5} height={0.35} depth={0.4} position={[1.3, 0.9, 0.1]} />

      {/* Roller (ref 85) */}
      <mesh castShadow position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.2, 16]} />
        <meshStandardMaterial color="#b8945a" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Ratchet disc (ref 86) */}
      <Disc partRef="86" radius={0.65} thickness={0.2} slots={8} position={[0, -0.5, -0.3]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Two-armed ratchet lever (ref 88) */}
      <Lever partRef="88" length={1.1} width={0.18} thickness={0.09} arms={2} position={[0.6, -0.9, -0.3]} rotation={[Math.PI / 2, 0, -0.4]} />

      {/* Mount pin (ref 90) */}
      <Pin partRef="90" length={0.5} radius={0.08} position={[0.6, -0.9, -0.3]} rotation={[0, 0, 0]} />

      {/* Bias spring (ref 91) */}
      <Spring partRef="91" coils={5} height={0.75} radius={0.11} wireRadius={0.022} position={[0.2, -1.4, -0.3]} />

      {/* Fixed mount pin (ref 81) */}
      <Pin partRef="81" length={0.55} radius={0.09} position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </group>
  );
}
