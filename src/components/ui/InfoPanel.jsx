import { useStore } from '../../store';
import patentData from '../../data/patent.json';

function findAssemblyForRef(ref) {
  for (const [name, data] of Object.entries(patentData.assemblies)) {
    if (data.components.includes(ref)) return { name, description: data.description };
  }
  return null;
}

function findMaterialForAssembly(assemblyName) {
  const materialMap = {
    'Drive Assembly': 'Steel',
    'Pawl Clutch System': 'Hardened Steel',
    'Control Lever Mechanism': 'Steel',
    'Stroke Member Assembly': 'Steel',
    'Program Control': 'Iron Core',
    'Monitoring System': 'Steel',
  };
  return materialMap[assemblyName] ?? 'Steel';
}

export function InfoPanel() {
  const selectedRef = useStore((s) => s.selectedRef);

  const bom = selectedRef ? patentData.bom.find((b) => b.ref === selectedRef) : null;
  const assembly = selectedRef ? findAssemblyForRef(selectedRef) : null;
  const matName = assembly ? findMaterialForAssembly(assembly.name) : null;
  const mat = matName ? patentData.materials.find((m) => m.name === matName) : null;

  return (
    <div className="info-panel">
      {!bom ? (
        <p className="dim">Click a part to inspect</p>
      ) : (
        <>
          <div className="info-ref">#{bom.ref}</div>
          <div className="info-name">{bom.component}</div>
          {assembly && (
            <div className="info-assembly">
              <span className="label">Assembly</span>
              <span className="value">{assembly.name}</span>
            </div>
          )}
          {mat && (
            <div className="info-material">
              <span className="label">Material</span>
              <span className="value">{mat.name}</span>
              <div className="tags">
                {mat.properties.map((p) => (
                  <span key={p} className="tag">{p}</span>
                ))}
              </div>
            </div>
          )}
          {assembly && <p className="desc">{assembly.description}</p>}
        </>
      )}
    </div>
  );
}
