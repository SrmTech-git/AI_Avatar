import { useEffect, useRef, useState } from 'react';
import { lerpRigState, type RigState } from './rig';

// Cubic ease-in-out — natural-feeling acceleration/deceleration
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Smoothly interpolates between RigStates over `duration` ms.
 * When `target` changes (different object identity), starts a new tween
 * from the current interpolated state, ensuring smooth interruption.
 *
 * IMPORTANT: parents should memoize `target` (e.g. via useMemo) so a new
 * object is only created when the underlying expression/gaze actually changes.
 * Otherwise the tween will restart on every render.
 */
export function useRigTween(target: RigState, duration: number = 350): RigState {
  const [current, setCurrent] = useState<RigState>(target);
  const startRef = useRef<RigState>(target);
  const targetRef = useRef<RigState>(target);
  const startTimeRef = useRef<number>(0);
  const currentRef = useRef<RigState>(target);

  // Keep currentRef in sync so we can snapshot it when a new tween starts
  currentRef.current = current;

  useEffect(() => {
    // New target — snapshot wherever we are now and tween toward target
    startRef.current = currentRef.current;
    targetRef.current = target;
    startTimeRef.current = performance.now();

    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);
      setCurrent(lerpRigState(startRef.current, targetRef.current, eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return current;
}
