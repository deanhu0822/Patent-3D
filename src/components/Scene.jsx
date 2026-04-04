import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { DriveAssembly } from './assemblies/DriveAssembly';
import { PawlClutchSystem } from './assemblies/PawlClutchSystem';
import { ControlLeverMechanism } from './assemblies/ControlLeverMechanism';
import { StrokeMemberAssembly } from './assemblies/StrokeMemberAssembly';
import { ProgramControl } from './assemblies/ProgramControl';
import { MonitoringSystem } from './assemblies/MonitoringSystem';
import { ResetButton } from './ui/Controls';
import { useStore } from '../store';

function SceneContent() {
  const setSelected = useStore((s) => s.setSelected);

  return (
    <>
      <color attach="background" args={['#0a0a0c']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Environment preset="warehouse" backgroundBlurriness={1} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

      {/* Deselect on background click */}
      <mesh
        position={[0, -3.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => setSelected(null)}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#111114" metalness={0.1} roughness={0.9} />
      </mesh>

      <DriveAssembly explodeOffset={[0, 3, 0]} />
      <PawlClutchSystem explodeOffset={[-4, 0, 0]} />
      <ControlLeverMechanism explodeOffset={[0, -3, 0]} />
      <StrokeMemberAssembly explodeOffset={[4, 0, 0]} />
      <ProgramControl explodeOffset={[-4, 3, 0]} />
      <MonitoringSystem explodeOffset={[4, 3, 0]} />

      <ContactShadows position={[0, -2.99, 0]} opacity={0.4} scale={30} blur={2} />

      {/* Reset camera button inside canvas context */}
      <ResetButtonOverlay />
    </>
  );
}

function ResetButtonOverlay() {
  // This is rendered outside Canvas in App.jsx; placeholder here
  return null;
}

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [12, 8, 12], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent />
    </Canvas>
  );
}
