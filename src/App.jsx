import { Scene } from './components/Scene';
import { InfoPanel } from './components/ui/InfoPanel';
import { AssemblySidebar } from './components/ui/AssemblySidebar';
import { Controls } from './components/ui/Controls';
import { useStore } from './store';
import { datasets } from './data/datasets';

function PatentHeader() {
  const activePatent = useStore((s) => s.activePatent);
  const setPatent = useStore((s) => s.setPatent);
  const ds = datasets[activePatent];

  return (
    <div className="patent-header">
      <div className="patent-switcher">
        <button
          className={`patent-tab ${activePatent === 'loom' ? 'active' : ''}`}
          onClick={() => setPatent('loom')}
        >
          US4529014A
        </button>
        <button
          className={`patent-tab ${activePatent === 'clutch' ? 'active' : ''}`}
          onClick={() => setPatent('clutch')}
        >
          US4441528A
        </button>
      </div>
      <span className="patent-title">{ds.title} · {ds.assignee}</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <div className="canvas-wrapper">
        <Scene />
      </div>

      <div className="ui-layer">
        <AssemblySidebar />
        <InfoPanel />
        <PatentHeader />
        <div className="controls-wrapper">
          <Controls />
        </div>
      </div>
    </div>
  );
}
