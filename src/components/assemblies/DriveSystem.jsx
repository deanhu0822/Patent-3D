import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Disc } from '../parts/Disc';
import { Shaft } from '../parts/Shaft';
import { Housing } from '../parts/Housing';

export function DriveSystem({ explodeOffset = [7, 0, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Drive System']);
  const animating = useStore((s) => s.animating);
  const groupRef = useExplode(explodeOffset);

  const driveGearRef = useRef();
  const pinion1Ref = useRef();
  const pinion2Ref = useRef();

  useFrame((_, delta) => {
    if (!animating) return;
    const speed = delta * 1.5;
    if (driveGearRef.current) driveGearRef.current.rotation.z -= speed;
    // Pinions turn opposite at ratio ~2.4:1
    if (pinion1Ref.current) pinion1Ref.current.rotation.z += speed * 2.4;
    if (pinion2Ref.current) pinion2Ref.current.rotation.z += speed * 2.4;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[5.8, -0.5, 0]}>
      {/* Electric motor C027 */}
      <Housing partRef="C027" material="steel/copper" width={0.9} height={0.9} depth={1.5}
        position={[0, -1.5, 0]} />
      {/* Motor shaft stub */}
      <Shaft partRef="C027" material="steel" length={0.6} radius={0.09}
        position={[0, -0.95, 0]} />

      {/* Drive belt C028 — flat torus */}
      <mesh castShadow
        userData={{ partRef: 'C028' }}
        onClick={(e) => { e.stopPropagation(); useStore.getState().setSelected('C028'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.1, 0.12, 6, 48]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0} roughness={0.95} />
      </mesh>

      {/* Main drive gear C024 */}
      <group ref={driveGearRef} position={[0, 0.6, 0]}>
        <Disc partRef="C024" material="steel" radius={0.5} thickness={0.12}
          rotation={[Math.PI / 2, 0, 0]} />
      </group>

      {/* Pinion gears C025 */}
      <group ref={pinion1Ref} position={[0.7, 1.4, 0]}>
        <Disc partRef="C025" material="steel" radius={0.2} thickness={0.12}
          rotation={[Math.PI / 2, 0, 0]} />
      </group>
      <group ref={pinion2Ref} position={[-0.7, 1.4, 0]}>
        <Disc partRef="C025" material="steel" radius={0.2} thickness={0.12}
          rotation={[Math.PI / 2, 0, 0]} />
      </group>

      {/* Bearings C026 */}
      {[[0, 0.6, 0.08], [0.7, 1.4, 0.08], [-0.7, 1.4, 0.08]].map((pos, i) => (
        <mesh key={i} castShadow position={pos}
          userData={{ partRef: 'C026' }}
          onClick={(e) => { e.stopPropagation(); useStore.getState().setSelected('C026'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <torusGeometry args={[0.15, 0.04, 8, 24]} />
          <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
