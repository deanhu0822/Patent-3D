import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { useExplode } from '../../hooks/useExplode';
import { Shaft } from '../parts/Shaft';
import { Disc } from '../parts/Disc';
import { Housing } from '../parts/Housing';

export function DriveAssembly({ explodeOffset = [0, 3, 0] }) {
  const visible = useStore((s) => s.visibleAssemblies['Drive Assembly']);
  const animating = useStore((s) => s.animating);
  const groupRef = useExplode(explodeOffset);

  const shaftRef = useRef();
  const eccentricRef = useRef();
  const strapRef = useRef();
  const rodRef = useRef();
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (!animating) return;
    angleRef.current += delta * 1.2;
    const angle = angleRef.current;

    if (shaftRef.current) shaftRef.current.rotation.z = angle;
    if (eccentricRef.current) eccentricRef.current.rotation.z = angle;

    const oscillation = Math.sin(angle) * 0.8;
    if (strapRef.current) strapRef.current.position.y = oscillation;
    if (rodRef.current) rodRef.current.position.y = oscillation - 1.2;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Drive shaft — horizontal along X */}
      <Shaft partRef="1" length={6} radius={0.28} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} innerRef={shaftRef} />

      {/* Eccentric disc on shaft */}
      <group ref={eccentricRef} position={[0, 0, 0.4]}>
        <Disc partRef="6" radius={1.1} thickness={0.32} eccentric />
      </group>

      {/* Strap / connecting link around eccentric */}
      <group ref={strapRef} position={[0, 0, 0.4]}>
        <mesh castShadow position={[0, 0, 0.18]}>
          <torusGeometry args={[1.25, 0.12, 10, 48]} />
          <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Strap connecting arm going down */}
        <mesh castShadow position={[0, -1.4, 0.18]}>
          <boxGeometry args={[0.18, 1.0, 0.12]} />
          <meshStandardMaterial color="#8a9aab" metalness={0.85} roughness={0.35} />
        </mesh>
      </group>

      {/* Rod going down */}
      <group ref={rodRef} position={[0, -1.2, 0.4]}>
        <Shaft partRef="9" length={2.2} radius={0.1} position={[0, -1.1, 0]} />
      </group>

      {/* Bearing housings at shaft ends */}
      <Housing partRef="10" width={0.5} height={0.5} depth={0.5} position={[-3.2, 0, 0]} />
      <Housing partRef="10" width={0.5} height={0.5} depth={0.5} position={[3.2, 0, 0]} />
    </group>
  );
}
