import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Housing } from '../parts/Housing';
import { Shaft } from '../parts/Shaft';

export function FrameAssembly({ explodeOffset = [0, 5, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Frame Assembly']);
  const groupRef = useExplode(explodeOffset);
  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Left side plate C002 */}
      <Housing partRef="C002" material="cast iron" width={0.25} height={7.5} depth={6} position={[-5, 0.75, 0]} />
      {/* Right side plate C003 */}
      <Housing partRef="C003" material="cast iron" width={0.25} height={7.5} depth={6} position={[5, 0.75, 0]} />
      {/* Top cross beams C004 — front & rear */}
      <Shaft partRef="C004" material="steel" length={10} radius={0.2} rotation={[0, 0, Math.PI / 2]} position={[0, 4.5, -2.5]} />
      <Shaft partRef="C004" material="steel" length={10} radius={0.2} rotation={[0, 0, Math.PI / 2]} position={[0, 4.5,  2.5]} />
      {/* Bottom cross beams C005 */}
      <Shaft partRef="C005" material="steel" length={10} radius={0.25} rotation={[0, 0, Math.PI / 2]} position={[0, -3, -2.5]} />
      <Shaft partRef="C005" material="steel" length={10} radius={0.25} rotation={[0, 0, Math.PI / 2]} position={[0, -3,  2.5]} />
    </group>
  );
}
