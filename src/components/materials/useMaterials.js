import { useMemo } from 'react';
import * as THREE from 'three';

export function useMaterials() {
  return useMemo(() => ({
    Steel: new THREE.MeshStandardMaterial({ color: '#8a9aab', metalness: 0.85, roughness: 0.35 }),
    'Spring Steel': new THREE.MeshStandardMaterial({ color: '#6b8a6b', metalness: 0.8, roughness: 0.4 }),
    'Hardened Steel': new THREE.MeshStandardMaterial({ color: '#5a6070', metalness: 0.9, roughness: 0.2 }),
    'Cast Iron': new THREE.MeshStandardMaterial({ color: '#4a4a50', metalness: 0.3, roughness: 0.8 }),
    Bronze: new THREE.MeshStandardMaterial({ color: '#b8945a', metalness: 0.75, roughness: 0.35 }),
    'Copper Wire': new THREE.MeshStandardMaterial({ color: '#c87040', metalness: 0.85, roughness: 0.3 }),
    'Iron Core': new THREE.MeshStandardMaterial({ color: '#3a4050', metalness: 0.4, roughness: 0.7 }),
  }), []);
}
