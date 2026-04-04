import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

export function useExplode(explodeOffset) {
  const groupRef = useRef();
  const exploded = useStore((s) => s.exploded);
  const current = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!groupRef.current) return;
    const target = exploded
      ? new THREE.Vector3(...explodeOffset)
      : new THREE.Vector3(0, 0, 0);
    current.current.lerp(target, 0.05);
    groupRef.current.position.copy(current.current);
  });

  return groupRef;
}
