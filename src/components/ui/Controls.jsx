import { useThree } from '@react-three/fiber';
import { useStore } from '../../store';

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

  return (
    <div className="controls-bar">
      <button className={`ctrl-btn ${exploded ? 'active' : ''}`} onClick={toggleExplode}>
        {exploded ? 'Collapse View' : 'Exploded View'}
      </button>
      <button className={`ctrl-btn ${animating ? 'active' : ''}`} onClick={toggleAnimation}>
        {animating ? 'Pause Drive' : 'Animate Drive'}
      </button>
      {/* ResetButton needs to be rendered inside Canvas context — rendered separately */}
    </div>
  );
}

export { ResetButton };
