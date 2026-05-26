import { useId } from 'react';
import { brows, eyes, mouths, gazeOffsets, getExpression } from './expressions';
import type { ExpressionCode, GazeCode } from './types';

interface FaceProps {
  expression: ExpressionCode;
  gaze?: GazeCode;
  size?: number;
}

export function Face({ expression, gaze, size = 280 }: FaceProps) {
  const rawId = useId();
  const fid = rawId.replace(/:/g, '');

  const expr = getExpression(expression);
  if (!expr) return null;

  const activeGaze = gaze || expr.defaultGaze || 'G1';
  const offset = gazeOffsets[activeGaze];
  const lpx = 70 + offset.dx;
  const lpy = 100 + offset.dy;
  const rpx = 130 + offset.dx;
  const rpy = 100 + offset.dy;

  const svgContent = `
    ${brows[expr.brows]}
    ${eyes[expr.eyes]('L', lpx, lpy, fid)}
    ${eyes[expr.eyes]('R', rpx, rpy, fid)}
    ${mouths[expr.mouth]}
  `;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
