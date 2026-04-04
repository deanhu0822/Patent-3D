import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { ElectroMagnet } from '../parts/ElectroMagnet';
import { Lever } from '../parts/Lever';
import { Spring } from '../parts/Spring';
import { Pin } from '../parts/Pin';

export function ProgramControl({ explodeOffset = [-4, 3, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Program Control']);
  const groupRef = useExplode(explodeOffset);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[-3.2, 1.0, 0]}>
      {/* Electromagnet housing (ref 51) */}
      <ElectroMagnet partRef="51" width={1.4} height={0.9} depth={0.7} position={[0, 0, 0]} />

      {/* Armature — pivoting plate (ref 53) */}
      <Lever partRef="53" length={1.0} width={0.35} thickness={0.08} arms={1} position={[0.9, -0.1, 0]} rotation={[Math.PI / 2, 0, 0.15]} />

      {/* Stop pin for armature (ref 54) */}
      <Pin partRef="54" length={0.4} radius={0.07} position={[1.4, -0.3, 0]} />

      {/* Extension spring (ref 69) */}
      <Spring partRef="69" coils={5} height={0.85} radius={0.12} wireRadius={0.025} position={[0.5, -0.9, 0]} />
    </group>
  );
}
