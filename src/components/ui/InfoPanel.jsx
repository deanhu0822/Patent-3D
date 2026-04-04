import { useStore } from '../../store';
import { datasets } from '../../data/datasets';

function formatDims(dims) {
  if (!dims) return null;
  const { unit, ...rest } = dims;
  return Object.entries(rest).map(([k, v]) => `${k}: ${v}${unit}`).join(' · ');
}

export function InfoPanel() {
  const selectedRef = useStore((s) => s.selectedRef);
  const activePatent = useStore((s) => s.activePatent);
  const ds = datasets[activePatent];

  const comp = selectedRef ? ds.components[selectedRef] : null;
  const assembly = selectedRef
    ? ds.assemblyGroups.find((g) => g.componentIds.includes(selectedRef))
    : null;

  return (
    <div className="info-panel">
      {!comp ? (
        <p className="dim">Click a part to inspect</p>
      ) : (
        <>
          <div className="info-ref">{comp.id}</div>
          <div className="info-name">{comp.name}</div>

          {assembly && (
            <div className="info-row">
              <span className="label">Assembly</span>
              <span className="value">{assembly.name}</span>
            </div>
          )}

          {comp.material && (
            <div className="info-row">
              <span className="label">Material</span>
              <span className="value">{comp.material}</span>
            </div>
          )}

          {comp.quantity > 1 && (
            <div className="info-row">
              <span className="label">Qty</span>
              <span className="value">×{comp.quantity}</span>
            </div>
          )}

          {comp.dimensions && (
            <div className="info-row" style={{ flexWrap: 'wrap' }}>
              <span className="label">Dims</span>
              <span className="value" style={{ fontSize: 10 }}>{formatDims(comp.dimensions)}</span>
            </div>
          )}

          {(comp.description || assembly?.description) && (
            <p className="desc">{comp.description || assembly.description}</p>
          )}
        </>
      )}
    </div>
  );
}
