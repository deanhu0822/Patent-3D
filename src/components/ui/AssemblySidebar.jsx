import { useStore } from '../../store';
import { datasets } from '../../data/datasets';

const COLORS = [
  '#7a8a9a', '#c4935a', '#5ac47a', '#5a9ac4',
  '#c45a5a', '#c4c45a', '#9a5ac4', '#5ac4c4',
];

export function AssemblySidebar() {
  const activePatent = useStore((s) => s.activePatent);
  const visibleAssemblies = useStore((s) => s.visibleAssemblies);
  const toggleAssembly = useStore((s) => s.toggleAssembly);
  const isolateAssembly = useStore((s) => s.isolateAssembly);
  const showAll = useStore((s) => s.showAll);

  const groups = datasets[activePatent].assemblyGroups;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Assemblies</span>
        <button className="btn-small" onClick={showAll}>Show All</button>
      </div>
      <ul className="assembly-list">
        {groups.map(({ name }, i) => {
          const visible = visibleAssemblies[name];
          return (
            <li key={name} className={`assembly-item ${visible ? '' : 'hidden'}`}>
              <button className="assembly-label" onClick={() => isolateAssembly(name)} title="Isolate">
                <span className="assembly-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="assembly-name">{name}</span>
              </button>
              <button className="eye-btn" onClick={() => toggleAssembly(name)} aria-label={visible ? 'Hide' : 'Show'}>
                {visible ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
