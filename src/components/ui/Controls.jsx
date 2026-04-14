import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useStore } from '../../store';

function formatCount(value) {
  return Number(value ?? 0).toLocaleString();
}

function getStatusBadge(report) {
  if (!report) {
    return { label: 'Checking...', tone: 'checking' };
  }

  if (report.status === 'blocked') {
    return { label: 'Blocked', tone: 'blocked' };
  }

  if (report.status === 'warning') {
    return { label: 'Warning', tone: 'warning' };
  }

  return { label: 'Printable', tone: 'printable' };
}

function ResetButton() {
  const { camera, controls } = useThree();
  const reset = () => {
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);
    if (controls) controls.target.set(0, 0, 0);
  };
  return (
    <button className="ctrl-btn" onClick={reset}>
      Reset Camera
    </button>
  );
}

export function Controls() {
  const exploded = useStore((s) => s.exploded);
  const toggleExplode = useStore((s) => s.toggleExplode);
  const animating = useStore((s) => s.animating);
  const toggleAnimation = useStore((s) => s.toggleAnimation);
  const exportModel = useStore((s) => s.exportModel);
  const activePatent = useStore((s) => s.activePatent);
  const visibleAssemblies = useStore((s) => s.visibleAssemblies);
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [result, setResult] = useState(null);
  const [strictMode, setStrictMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      if (!cancelled) {
        setAnalysis(null);
        setResult(null);
      }

      if (!exportModel) {
        if (!cancelled) setAnalysis(null);
        return;
      }

      try {
        const nextReport = await exportModel({ intent: 'analyze', strict: strictMode });
        if (!cancelled) {
          setError(null);
          setAnalysis(nextReport);
        }
      } catch (err) {
        if (!cancelled) {
          setAnalysis(null);
          setError(err.message);
        }
      }
    }

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [exportModel, strictMode, activePatent, exploded, visibleAssemblies]);

  async function handleExport(format) {
    if (!exportModel || exporting) return;

    setExporting(format);
    setError(null);
    setResult(null);

    try {
      const nextReport = await exportModel({ intent: 'export', format, strict: strictMode });
      setAnalysis(nextReport);
      setResult(nextReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(null);
    }
  }

  const statusBadge = getStatusBadge(analysis);
  const stats = analysis?.stats;

  return (
    <div className="controls-stack">
      <button
        type="button"
        className={`status-badge ${statusBadge.tone}`}
        onClick={() => setShowDetails((value) => !value)}
        aria-expanded={showDetails}
      >
        <span>{statusBadge.label}</span>
        <span className="status-badge-hint">{showDetails ? 'Hide details' : 'Show details'}</span>
      </button>
      {showDetails && (
        <div className="status-details">
          <div className="status-details-title">Current Printability</div>
          {!stats ? (
            <div className="status-details-empty">Checking current model...</div>
          ) : (
            <div className="status-details-grid">
              <div className="status-details-row">
                <span className="status-details-key">Triangles</span>
                <span className="status-details-value">{formatCount(stats.triangleCount)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Open edges</span>
                <span className="status-details-value">{formatCount(stats.openEdgeCount)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Non-manifold</span>
                <span className="status-details-value">{formatCount(stats.nonManifoldEdgeCount)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Shells</span>
                <span className="status-details-value">{formatCount(stats.shellCount)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Invalid vertices</span>
                <span className="status-details-value">{formatCount(stats.invalidVertexCount)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Meshes</span>
                <span className="status-details-value">{formatCount(stats.meshCount)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Degenerate removed</span>
                <span className="status-details-value">{formatCount(stats.removedDegenerateTriangles)}</span>
              </div>
              <div className="status-details-row">
                <span className="status-details-key">Duplicate faces removed</span>
                <span className="status-details-value">{formatCount(stats.removedDuplicateFaces)}</span>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="controls-bar">
        <button className={`ctrl-btn ${exploded ? 'active' : ''}`} onClick={toggleExplode}>
          {exploded ? 'Collapse View' : 'Exploded View'}
        </button>
        <button className={`ctrl-btn ${animating ? 'active' : ''}`} onClick={toggleAnimation}>
          {animating ? 'Pause Drive' : 'Animate Drive'}
        </button>
        <button
          className={`ctrl-btn ${strictMode ? 'active' : ''}`}
          onClick={() => {
            setStrictMode((value) => !value);
            setError(null);
            setAnalysis(null);
            setResult(null);
          }}
        >
          Strict Print Mode
        </button>
        <button className="ctrl-btn" onClick={() => handleExport('stl')} disabled={!exportModel || !!exporting}>
          {exporting === 'stl' ? 'Exporting STL...' : 'Export STL'}
        </button>
        <button className="ctrl-btn" onClick={() => handleExport('3mf')} disabled={!exportModel || !!exporting}>
          {exporting === '3mf' ? 'Exporting 3MF...' : 'Export 3MF'}
        </button>
        {/* ResetButton needs to be rendered inside Canvas context — rendered separately */}
      </div>
      {strictMode && (
        <div className="controls-help">Blocks STL/3MF export when the mesh is not a valid printable solid.</div>
      )}
      {error && <div className="controls-error">{error}</div>}
      {result?.blocked && (
        <div className="controls-error-box">
          <div className="controls-error-title">{result.blockingTitle}</div>
          <div className="controls-error-reasons">{result.blockingReasons.join(' ')}</div>
        </div>
      )}
      {result?.exported && result.strict?.passed && <div className="controls-success">{result.strict.successMessage}</div>}
      {result?.exported && result.repairs?.length > 0 && (
        <div className="controls-note">Auto-repaired export mesh: {result.repairs.join(' ')}</div>
      )}
      {result?.exported && result.warnings?.length > 0 && <div className="controls-warning">{result.warnings.join(' ')}</div>}
    </div>
  );
}

export { ResetButton };
