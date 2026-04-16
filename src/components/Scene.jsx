import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useStore } from '../store';
import { datasets } from '../data/datasets';
import { analyzePrintableModel, exportPrintableModel } from '../utils/modelExport';

// Loom assemblies
import { FrameAssembly } from './assemblies/FrameAssembly';
import { WarpSystem } from './assemblies/WarpSystem';
import { ClothTakeupSystem } from './assemblies/ClothTakeupSystem';
import { SheddingMechanism } from './assemblies/SheddingMechanism';
import { WeftInsertionSystem } from './assemblies/WeftInsertionSystem';
import { BeatupMechanism } from './assemblies/BeatupMechanism';
import { TreadleSystem } from './assemblies/TreadleSystem';
import { DriveSystem } from './assemblies/DriveSystem';

// Clutch assemblies
import { DriveAssembly } from './assemblies/DriveAssembly';
import { PawlClutchSystem } from './assemblies/PawlClutchSystem';
import { ControlLeverMechanism } from './assemblies/ControlLeverMechanism';
import { StrokeMemberAssembly } from './assemblies/StrokeMemberAssembly';
import { ProgramControl } from './assemblies/ProgramControl';
import { MonitoringSystem } from './assemblies/MonitoringSystem';

function LoomScene() {
  return (
    <>
      <FrameAssembly       explodeOffset={[0, 6, 0]} />
      <WarpSystem          explodeOffset={[0, 0, -8]} />
      <ClothTakeupSystem   explodeOffset={[0, 0, 8]} />
      <SheddingMechanism   explodeOffset={[0, 5, 0]} />
      <WeftInsertionSystem explodeOffset={[-8, 0, 0]} />
      <BeatupMechanism     explodeOffset={[0, 3, 6]} />
      <TreadleSystem       explodeOffset={[0, -6, 0]} />
      <DriveSystem         explodeOffset={[9, 0, 0]} />
    </>
  );
}

function ClutchScene() {
  return (
    <>
      <DriveAssembly         explodeOffset={[0, 3, 0]} />
      <PawlClutchSystem      explodeOffset={[-4, 0, 0]} />
      <ControlLeverMechanism explodeOffset={[0, -3, 0]} />
      <StrokeMemberAssembly  explodeOffset={[4, 0, 0]} />
      <ProgramControl        explodeOffset={[-4, 3, 0]} />
      <MonitoringSystem      explodeOffset={[4, 3, 0]} />
    </>
  );
}

function SceneContent() {
  const setSelected = useStore((s) => s.setSelected);
  const setExportModel = useStore((s) => s.setExportModel);
  const activePatent = useStore((s) => s.activePatent);
  const selectedRef = useStore((s) => s.selectedRef);
  const isLoom = activePatent === 'loom';
  const printableRootRef = useRef();

  useEffect(() => {
    setExportModel(({ intent = 'export', format = '3mf', strict = false }) => {
      const { activePatent: currentPatent, exploded, selectedRef: currentSelection } = useStore.getState();
      const selectedName = currentSelection
        ? (datasets[currentPatent].components[currentSelection]?.name ?? currentSelection)
        : 'selection';
      const fileName = `${datasets[currentPatent].title} ${selectedName}${exploded ? ' exploded' : ''}`;

      if (intent === 'analyze') {
        return analyzePrintableModel(printableRootRef.current, {
          format,
          strict,
          selectedRef: currentSelection,
        });
      }

      return exportPrintableModel(printableRootRef.current, {
        format,
        name: fileName,
        strict,
        selectedRef: currentSelection,
      });
    });

    return () => setExportModel(null);
  }, [setExportModel, selectedRef]);

  return (
    <>
      <color attach="background" args={['#0a0a0c']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Environment preset="warehouse" backgroundBlurriness={1} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

      <mesh position={[0, -4.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={() => setSelected(null)}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#111114" metalness={0.1} roughness={0.9} />
      </mesh>

      <group ref={printableRootRef}>
        {isLoom ? <LoomScene /> : <ClutchScene />}
      </group>

      <ContactShadows position={[0, -3.99, 0]} opacity={0.4} scale={40} blur={2} />
    </>
  );
}

export function Scene() {
  return (
    <Canvas shadows camera={{ position: [16, 10, 16], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <SceneContent />
    </Canvas>
  );
}
