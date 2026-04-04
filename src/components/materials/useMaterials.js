import { useMemo } from 'react';
import * as THREE from 'three';

export function useMaterials() {
  return useMemo(() => {
    const defs = {
      Steel:           { color: '#8a9aab', metalness: 0.85, roughness: 0.35 },
      'Spring Steel':  { color: '#6b8a6b', metalness: 0.80, roughness: 0.40 },
      'Hardened Steel':{ color: '#5a6070', metalness: 0.90, roughness: 0.20 },
      'Cast Iron':     { color: '#4a4a50', metalness: 0.30, roughness: 0.80 },
      Bronze:          { color: '#b8945a', metalness: 0.75, roughness: 0.35 },
      'Copper Wire':   { color: '#c87040', metalness: 0.85, roughness: 0.30 },
      'Iron Core':     { color: '#3a4050', metalness: 0.40, roughness: 0.70 },
      // loom materials (lowercase keys matching loom_bom.json)
      'cast iron':     { color: '#4a4a50', metalness: 0.30, roughness: 0.80 },
      'steel':         { color: '#8a9aab', metalness: 0.85, roughness: 0.35 },
      'hardwood':      { color: '#8b6343', metalness: 0.00, roughness: 0.90 },
      'aluminum':      { color: '#c8cdd4', metalness: 0.80, roughness: 0.30 },
      'steel wire':    { color: '#606870', metalness: 0.90, roughness: 0.20 },
      'plastic':       { color: '#d4c8b8', metalness: 0.00, roughness: 0.70 },
      'rubber':        { color: '#1a1a1c', metalness: 0.00, roughness: 0.95 },
      'copper':        { color: '#c87040', metalness: 0.85, roughness: 0.30 },
      'steel/copper':  { color: '#8a9aab', metalness: 0.80, roughness: 0.40 },
    };
    return Object.fromEntries(
      Object.entries(defs).map(([k, v]) => [k, new THREE.MeshStandardMaterial(v)])
    );
  }, []);
}
