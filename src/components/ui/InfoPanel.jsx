import { useState } from 'react';
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
  const supplierCache = useStore((s) => s.supplierCache);
  const setSupplier = useStore((s) => s.setSupplier);
  const ds = datasets[activePatent];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const comp = selectedRef ? ds.components[selectedRef] : null;
  const assembly = selectedRef
    ? ds.assemblyGroups.find((g) => g.componentIds.includes(selectedRef))
    : null;

  const cached = selectedRef ? supplierCache[selectedRef] : null;

  async function handleFindSupplier() {
    if (!comp) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partName: comp.name,
          material: comp.material ?? null,
          description: comp.description ?? assembly?.description ?? null,
          dimensions: comp.dimensions ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setSupplier(selectedRef, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

          <div className="supplier-section" style={{ pointerEvents: 'auto' }}>
            {cached ? (
              <div className="supplier-result">
                <span className="label">Supplier</span>
                {cached.url ? (
                  <a
                    className="supplier-link"
                    href={cached.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {cached.supplier}
                  </a>
                ) : (
                  <span className="value">{cached.supplier}</span>
                )}
                {cached.blurb && <p className="desc" style={{ marginTop: 4 }}>{cached.blurb}</p>}
                <button className="supplier-btn secondary" onClick={handleFindSupplier} disabled={loading}>
                  {loading ? 'Searching…' : 'Refresh'}
                </button>
              </div>
            ) : (
              <>
                {error && <p className="supplier-error">{error}</p>}
                <button className="supplier-btn" onClick={handleFindSupplier} disabled={loading} style={{ pointerEvents: 'auto' }}>
                  {loading ? 'Searching…' : 'Find Supplier'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
