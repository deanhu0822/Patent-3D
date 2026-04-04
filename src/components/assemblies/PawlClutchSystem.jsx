import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Disc } from '../parts/Disc';
import { Pawl } from '../parts/Pawl';
import { Pin } from '../parts/Pin';
import { Spring } from '../parts/Spring';

export function PawlClutchSystem({ explodeOffset = [-4, 0, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Pawl Clutch System']);
  const groupRef = useExplode(explodeOffset);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[-1.5, 0, 0.9]}>
      {/* Slotted disc — represents shaft slots (ref 2) */}
      <Disc partRef="2" radius={0.9} thickness={0.25} slots={2} rotation={[0, 0, 0]} position={[0, 0, 0]} />

      {/* Pawl (ref 5) angled toward disc slot */}
      <Pawl
        partRef="5"
        length={1.5}
        width={0.28}
        thickness={0.14}
        position={[-0.5, -1.1, 0.07]}
        rotation={[0, 0, -0.5]}
      />

      {/* Pivot pin (ref 4) */}
      <Pin partRef="4" length={0.6} radius={0.1} position={[-0.9, -1.1, 0.07]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Extension spring biasing pawl (ref 60) */}
      <Spring
        partRef="60"
        coils={6}
        height={0.9}
        radius={0.12}
        wireRadius={0.025}
        position={[-0.2, -1.7, 0.07]}
        rotation={[0, 0, 0.4]}
      />
    </group>
  );
}
