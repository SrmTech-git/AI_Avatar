import { useEffect, useId, useMemo, useState } from 'react';
import { getRigState, browPath, eyePath, mouthPath } from './rig';
import { useRigTween } from './useRigTween';
import type { ExpressionCode, GazeCode } from './types';

interface FaceProps {
  expression: ExpressionCode;
  gaze?: GazeCode;
  size?: number;
}

export function Face({ expression, gaze, size = 280 }: FaceProps) {
  // Memoize so useRigTween only sees a new object when expression/gaze actually changes
  const target = useMemo(() => getRigState(expression, gaze), [expression, gaze]);
  const state = useRigTween(target);

  // Fritz trigger: when A19 is selected, briefly play the glitch animation
  const [fritzActive, setFritzActive] = useState(false);
  useEffect(() => {
    if (expression !== 'A19') return;
    // Reset then re-apply on next frame so the CSS animation restarts
    setFritzActive(false);
    const raf = requestAnimationFrame(() => setFritzActive(true));
    const timeout = setTimeout(() => setFritzActive(false), 1100);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [expression]);

  const rawId = useId();
  const fid = rawId.replace(/:/g, '');
  const leftClipId = `eye-clip-L-${fid}`;
  const rightClipId = `eye-clip-R-${fid}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={fritzActive ? 'face-svg fritzing' : 'face-svg'}
    >
      <defs>
        <clipPath id={leftClipId}>
          <path d={eyePath(state.eyes.left)} />
        </clipPath>
        <clipPath id={rightClipId}>
          <path d={eyePath(state.eyes.right)} />
        </clipPath>
      </defs>

      {/* Brows */}
      <path
        d={browPath(state.brows.left)}
        fill="none"
        stroke="black"
        strokeWidth={state.brows.left.strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={browPath(state.brows.right)}
        fill="none"
        stroke="black"
        strokeWidth={state.brows.right.strokeWidth}
        strokeLinecap="round"
      />

      {/* Left eye + pupil */}
      <path
        d={eyePath(state.eyes.left)}
        fill="white"
        stroke="black"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <circle
        cx={state.eyes.left.pupil.x}
        cy={state.eyes.left.pupil.y}
        r={state.eyes.left.pupil.r}
        fill="black"
        clipPath={`url(#${leftClipId})`}
      />

      {/* Right eye + pupil */}
      <path
        d={eyePath(state.eyes.right)}
        fill="white"
        stroke="black"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <circle
        cx={state.eyes.right.pupil.x}
        cy={state.eyes.right.pupil.y}
        r={state.eyes.right.pupil.r}
        fill="black"
        clipPath={`url(#${rightClipId})`}
      />

      {/* Mouth */}
      <path
        d={mouthPath(state.mouth)}
        fill="white"
        stroke="black"
        strokeWidth={state.mouth.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
