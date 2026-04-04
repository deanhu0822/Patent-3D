import { Scene } from './components/Scene';
import { InfoPanel } from './components/ui/InfoPanel';
import { AssemblySidebar } from './components/ui/AssemblySidebar';
import { Controls } from './components/ui/Controls';

export default function App() {
  return (
    <div className="app">
      <div className="canvas-wrapper">
        <Scene />
      </div>

      <div className="ui-layer">
        <AssemblySidebar />
        <InfoPanel />

        <div className="patent-header">
          <span className="patent-id">US4441528A</span>
          <span className="patent-title">Clutch Arrangement · Weaving Machine · Sulzer AG</span>
        </div>

        <div className="controls-wrapper">
          <Controls />
        </div>
      </div>
    </div>
  );
}
