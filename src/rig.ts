import type { ExpressionCode, GazeCode } from './types';

// ============================================================================
// Face Rig — a parameterized model where every face has the same structure,
// only the numbers (control points) change between expressions.
// ============================================================================

export type Point = [number, number];

export interface BrowSpec {
  start: Point;
  control: Point;
  end: Point;
  strokeWidth: number;
}

export interface EyeSpec {
  leftCorner: Point;
  rightCorner: Point;
  upperControl1: Point;
  upperControl2: Point;
  lowerControl1: Point;
  lowerControl2: Point;
  pupil: { x: number; y: number; r: number };
}

export interface MouthSpec {
  leftCorner: Point;
  rightCorner: Point;
  upperControl1: Point;
  upperControl2: Point;
  lowerControl1: Point;
  lowerControl2: Point;
  strokeWidth: number;
}

export interface RigState {
  brows: { left: BrowSpec; right: BrowSpec };
  eyes: { left: EyeSpec; right: EyeSpec };
  mouth: MouthSpec;
}

// ============================================================================
// Path string generators
// ============================================================================

export function browPath(b: BrowSpec): string {
  return `M ${b.start[0]} ${b.start[1]} Q ${b.control[0]} ${b.control[1]} ${b.end[0]} ${b.end[1]}`;
}

export function eyePath(e: EyeSpec): string {
  // Cubic Bezier for upper lid (left → right), then cubic for lower lid (right → left), closed.
  return (
    `M ${e.leftCorner[0]} ${e.leftCorner[1]} ` +
    `C ${e.upperControl1[0]} ${e.upperControl1[1]} ${e.upperControl2[0]} ${e.upperControl2[1]} ${e.rightCorner[0]} ${e.rightCorner[1]} ` +
    `C ${e.lowerControl2[0]} ${e.lowerControl2[1]} ${e.lowerControl1[0]} ${e.lowerControl1[1]} ${e.leftCorner[0]} ${e.leftCorner[1]} Z`
  );
}

export function mouthPath(m: MouthSpec): string {
  // Cubic Bezier upper lip + cubic lower lip, closed. When upper and lower
  // control points coincide, mouth is closed (collapsed to single visible curve).
  return (
    `M ${m.leftCorner[0]} ${m.leftCorner[1]} ` +
    `C ${m.upperControl1[0]} ${m.upperControl1[1]} ${m.upperControl2[0]} ${m.upperControl2[1]} ${m.rightCorner[0]} ${m.rightCorner[1]} ` +
    `C ${m.lowerControl2[0]} ${m.lowerControl2[1]} ${m.lowerControl1[0]} ${m.lowerControl1[1]} ${m.leftCorner[0]} ${m.leftCorner[1]} Z`
  );
}

// ============================================================================
// Interpolation
// ============================================================================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function lerpBrow(a: BrowSpec, b: BrowSpec, t: number): BrowSpec {
  return {
    start: lerpPoint(a.start, b.start, t),
    control: lerpPoint(a.control, b.control, t),
    end: lerpPoint(a.end, b.end, t),
    strokeWidth: lerp(a.strokeWidth, b.strokeWidth, t),
  };
}

function lerpEye(a: EyeSpec, b: EyeSpec, t: number): EyeSpec {
  return {
    leftCorner: lerpPoint(a.leftCorner, b.leftCorner, t),
    rightCorner: lerpPoint(a.rightCorner, b.rightCorner, t),
    upperControl1: lerpPoint(a.upperControl1, b.upperControl1, t),
    upperControl2: lerpPoint(a.upperControl2, b.upperControl2, t),
    lowerControl1: lerpPoint(a.lowerControl1, b.lowerControl1, t),
    lowerControl2: lerpPoint(a.lowerControl2, b.lowerControl2, t),
    pupil: {
      x: lerp(a.pupil.x, b.pupil.x, t),
      y: lerp(a.pupil.y, b.pupil.y, t),
      r: lerp(a.pupil.r, b.pupil.r, t),
    },
  };
}

function lerpMouth(a: MouthSpec, b: MouthSpec, t: number): MouthSpec {
  return {
    leftCorner: lerpPoint(a.leftCorner, b.leftCorner, t),
    rightCorner: lerpPoint(a.rightCorner, b.rightCorner, t),
    upperControl1: lerpPoint(a.upperControl1, b.upperControl1, t),
    upperControl2: lerpPoint(a.upperControl2, b.upperControl2, t),
    lowerControl1: lerpPoint(a.lowerControl1, b.lowerControl1, t),
    lowerControl2: lerpPoint(a.lowerControl2, b.lowerControl2, t),
    strokeWidth: lerp(a.strokeWidth, b.strokeWidth, t),
  };
}

export function lerpRigState(a: RigState, b: RigState, t: number): RigState {
  return {
    brows: {
      left: lerpBrow(a.brows.left, b.brows.left, t),
      right: lerpBrow(a.brows.right, b.brows.right, t),
    },
    eyes: {
      left: lerpEye(a.eyes.left, b.eyes.left, t),
      right: lerpEye(a.eyes.right, b.eyes.right, t),
    },
    mouth: lerpMouth(a.mouth, b.mouth, t),
  };
}

// ============================================================================
// Gaze (applied as an offset to pupils)
// ============================================================================

export const gazeOffsets: Record<GazeCode, { dx: number; dy: number }> = {
  G1: { dx: 0, dy: 0 },
  G2: { dx: -3, dy: -10 },
  G3: { dx: 0, dy: 10 },
};

export function applyGaze(state: RigState, gaze: GazeCode): RigState {
  const offset = gazeOffsets[gaze];
  return {
    ...state,
    eyes: {
      left: {
        ...state.eyes.left,
        pupil: {
          ...state.eyes.left.pupil,
          x: state.eyes.left.pupil.x + offset.dx,
          y: state.eyes.left.pupil.y + offset.dy,
        },
      },
      right: {
        ...state.eyes.right,
        pupil: {
          ...state.eyes.right.pupil,
          x: state.eyes.right.pupil.x + offset.dx,
          y: state.eyes.right.pupil.y + offset.dy,
        },
      },
    },
  };
}

// ============================================================================
// Helpers for building eye / mouth specs
// ============================================================================

const CIRCLE_K = 4 / 3; // cubic semicircle approximation

type EyeShape =
  | 'open'
  | 'wide'
  | 'lidded-light'
  | 'lidded-heavy'
  | 'narrowed'
  | 'sad';

function eye(cx: number, shape: EyeShape, pupilOverride?: Partial<{ x: number; y: number; r: number }>): EyeSpec {
  const cy = 100;
  let leftCorner: Point, rightCorner: Point;
  let upperC1: Point, upperC2: Point, lowerC1: Point, lowerC2: Point;
  let pupilY = cy;
  let pupilR = 12;

  switch (shape) {
    case 'open': {
      const r = 25, d = r * CIRCLE_K;
      leftCorner = [cx - r, cy]; rightCorner = [cx + r, cy];
      upperC1 = [cx - r, cy - d]; upperC2 = [cx + r, cy - d];
      lowerC1 = [cx - r, cy + d]; lowerC2 = [cx + r, cy + d];
      break;
    }
    case 'wide': {
      const r = 28, d = r * CIRCLE_K;
      leftCorner = [cx - r, cy]; rightCorner = [cx + r, cy];
      upperC1 = [cx - r, cy - d]; upperC2 = [cx + r, cy - d];
      lowerC1 = [cx - r, cy + d]; lowerC2 = [cx + r, cy + d];
      pupilR = 13;
      break;
    }
    case 'lidded-light': {
      const r = 23;
      leftCorner = [cx - r, cy - 8]; rightCorner = [cx + r, cy - 8];
      upperC1 = [cx - r, cy - 14]; upperC2 = [cx + r, cy - 14];
      lowerC1 = [cx - r, cy + 25]; lowerC2 = [cx + r, cy + 25];
      pupilY = cy + 2; pupilR = 11;
      break;
    }
    case 'lidded-heavy': {
      const r = 25;
      leftCorner = [cx - r, cy]; rightCorner = [cx + r, cy];
      upperC1 = [cx - r, cy - 1]; upperC2 = [cx + r, cy - 1];
      lowerC1 = [cx - r, cy + 33]; lowerC2 = [cx + r, cy + 33];
      pupilY = cy + 5;
      break;
    }
    case 'narrowed': {
      const r = 24;
      leftCorner = [cx - r, cy - 5]; rightCorner = [cx + r, cy - 5];
      upperC1 = [cx - r, cy - 9]; upperC2 = [cx + r, cy - 9];
      lowerC1 = [cx - r, cy + 14]; lowerC2 = [cx + r, cy + 14];
      pupilY = cy; pupilR = 11;
      break;
    }
    case 'sad': {
      const r = 25, d = r * CIRCLE_K;
      leftCorner = [cx - r, cy]; rightCorner = [cx + r, cy];
      upperC1 = [cx - r, cy - d]; upperC2 = [cx + r, cy - d];
      lowerC1 = [cx - r, cy + d - 6]; lowerC2 = [cx + r, cy + d - 6];
      pupilY = cy - 2;
      break;
    }
  }

  return {
    leftCorner, rightCorner,
    upperControl1: upperC1, upperControl2: upperC2,
    lowerControl1: lowerC1, lowerControl2: lowerC2,
    pupil: {
      x: pupilOverride?.x ?? cx,
      y: pupilOverride?.y ?? pupilY,
      r: pupilOverride?.r ?? pupilR,
    },
  };
}

/**
 * Build a MouthSpec from simple inputs.
 * Pass a single `upperControl` for a closed mouth (single curve).
 * Pass both `upperControl` and `lowerControl` for an open mouth.
 * Internally converts to cubic Bezier representation.
 */
function mouth(
  leftCorner: Point,
  rightCorner: Point,
  upperControl: Point,
  lowerControl?: Point,
  strokeWidth: number = 3
): MouthSpec {
  const upper = upperControl;
  const lower = lowerControl ?? upperControl;
  // Convert each quadratic control to two cubic controls
  const upperC1: Point = [(leftCorner[0] + 2 * upper[0]) / 3, (leftCorner[1] + 2 * upper[1]) / 3];
  const upperC2: Point = [(rightCorner[0] + 2 * upper[0]) / 3, (rightCorner[1] + 2 * upper[1]) / 3];
  const lowerC1: Point = [(leftCorner[0] + 2 * lower[0]) / 3, (leftCorner[1] + 2 * lower[1]) / 3];
  const lowerC2: Point = [(rightCorner[0] + 2 * lower[0]) / 3, (rightCorner[1] + 2 * lower[1]) / 3];
  return {
    leftCorner, rightCorner,
    upperControl1: upperC1, upperControl2: upperC2,
    lowerControl1: lowerC1, lowerControl2: lowerC2,
    strokeWidth,
  };
}

// ============================================================================
// The 18 expressions, defined as rig parameter sets
// ============================================================================

const browFlat: BrowSpec = { start: [40, 55], control: [65, 55], end: [90, 55], strokeWidth: 3 };
const browFlatRight: BrowSpec = { start: [110, 55], control: [135, 55], end: [160, 55], strokeWidth: 3 };

export const rigStates: Record<ExpressionCode, RigState> = {
  // ============ RESTING ============
  A1: {
    brows: { left: browFlat, right: browFlatRight },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([86, 161], [114, 161], [100, 167]),
  },
  A2: {
    brows: {
      left: { start: [40, 57], control: [65, 55.5], end: [90, 54], strokeWidth: 3 },
      right: { start: [110, 54], control: [135, 55.5], end: [160, 57], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([82, 160], [118, 160], [100, 170]),
  },
  A3: {
    brows: {
      left: { start: [40, 56], control: [65, 57], end: [90, 58], strokeWidth: 3 },
      right: { start: [110, 50], control: [135, 49], end: [160, 48], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([90, 160], [110, 160], [100, 160]),
  },
  A4: {
    brows: { left: browFlat, right: browFlatRight },
    eyes: { left: eye(70, 'lidded-light'), right: eye(130, 'lidded-light') },
    mouth: mouth([85, 160], [115, 160], [100, 160]),
  },

  // ============ WARM / FUN ============
  A5: {
    brows: { left: browFlat, right: browFlatRight },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([65, 158], [135, 158], [100, 172]),
  },
  A6: {
    brows: {
      left: { start: [40, 48], control: [65, 48], end: [90, 48], strokeWidth: 3 },
      right: { start: [110, 48], control: [135, 48], end: [160, 48], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([70, 152], [130, 152], [100, 152], [100, 188]),
  },
  A7: {
    brows: {
      left: { start: [40, 48], control: [65, 48], end: [90, 48], strokeWidth: 3 },
      right: { start: [110, 48], control: [135, 48], end: [160, 48], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'lidded-light'), right: eye(130, 'lidded-light') },
    mouth: mouth([82, 160], [118, 160], [100, 170]),
  },
  A8: {
    brows: { left: browFlat, right: browFlatRight },
    eyes: { left: eye(70, 'lidded-heavy'), right: eye(130, 'lidded-heavy') },
    mouth: mouth([78, 161], [124, 152], [101, 170]),
  },
  A9: {
    brows: {
      left: { start: [40, 45], control: [65, 36], end: [90, 45], strokeWidth: 3 },
      right: { start: [110, 45], control: [135, 36], end: [160, 45], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'wide'), right: eye(130, 'wide') },
    mouth: mouth([76, 156], [124, 156], [100, 162], [100, 184]),
  },

  // ============ CURIOUS / ENGAGED ============
  A10: {
    brows: {
      left: { start: [40, 42], control: [65, 42], end: [90, 42], strokeWidth: 3 },
      right: { start: [110, 42], control: [135, 42], end: [160, 42], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([95, 162], [105, 162], [100, 156], [100, 168]),
  },
  A11: {
    brows: {
      left: { start: [40, 35], control: [65, 36.5], end: [90, 38], strokeWidth: 3 },
      right: { start: [110, 38], control: [135, 36.5], end: [160, 35], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'wide'), right: eye(130, 'wide') },
    mouth: mouth([92, 162], [108, 162], [100, 151], [100, 173]),
  },
  A12: {
    brows: {
      left: browFlat,
      right: { start: [115, 60], control: [137.5, 49], end: [160, 38], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'lidded-heavy'), right: eye(130, 'lidded-heavy') },
    mouth: mouth([85, 160], [115, 160], [100, 160]),
  },

  // ============ CONCERNED / SERIOUS ============
  A13: {
    brows: {
      left: { start: [40, 62], control: [65, 55], end: [90, 48], strokeWidth: 3 },
      right: { start: [110, 48], control: [135, 55], end: [160, 62], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([80, 165], [120, 165], [100, 155]),
  },
  A14: {
    // hesitant: furrowed-light brows, open eyes, WAVE mouth (rises early, descends right);
    // defaults to sideways gaze (G2)
    brows: {
      left: { start: [42, 58], control: [65, 60], end: [88, 62], strokeWidth: 3 },
      right: { start: [112, 62], control: [135, 60], end: [158, 58], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: {
      // Direct cubic spec: wave shape. Left control pulls UP, right control pulls DOWN.
      // Closed mouth (upper == lower controls).
      leftCorner: [80, 158],
      rightCorner: [122, 168],
      upperControl1: [88, 148],
      upperControl2: [114, 176],
      lowerControl1: [88, 148],
      lowerControl2: [114, 176],
      strokeWidth: 3,
    },
  },
  A15: {
    brows: {
      left: { start: [40, 65], control: [65, 52.5], end: [90, 40], strokeWidth: 3 },
      right: { start: [110, 40], control: [135, 52.5], end: [160, 65], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'sad'), right: eye(130, 'sad') },
    mouth: mouth([75, 168], [125, 168], [100, 148]),
  },
  A16: {
    brows: {
      left: { start: [40, 65], control: [65, 52.5], end: [90, 40], strokeWidth: 3 },
      right: { start: [110, 40], control: [135, 52.5], end: [160, 65], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'wide'), right: eye(130, 'wide') },
    mouth: mouth([75, 168], [125, 168], [100, 148], [100, 165]),
  },
  A17: {
    brows: {
      left: { start: [42, 58], control: [65, 60], end: [88, 62], strokeWidth: 3 },
      right: { start: [112, 62], control: [135, 60], end: [158, 58], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'narrowed'), right: eye(130, 'narrowed') },
    mouth: mouth([80, 165], [120, 165], [100, 155]),
  },
  A18: {
    brows: {
      left: { start: [28, 28], control: [61.5, 49], end: [95, 70], strokeWidth: 4 },
      right: { start: [105, 70], control: [138.5, 49], end: [172, 28], strokeWidth: 4 },
    },
    eyes: { left: eye(70, 'open'), right: eye(130, 'open') },
    mouth: mouth([60, 160], [138, 168], [100, 162], [100, 162], 4),
  },

  // ============ NON-HUMAN ============
  A19: {
    brows: {
      left: { start: [40, 50], control: [65, 44], end: [90, 55], strokeWidth: 3 },
      right: { start: [110, 55], control: [135, 44], end: [160, 50], strokeWidth: 3 },
    },
    eyes: { left: eye(70, 'wide'), right: eye(130, 'wide') },
    mouth: mouth([88, 162], [112, 162], [100, 158], [100, 170]),
  },
};

// ============================================================================
// Category — used to drive ambient background color
// ============================================================================

export type ExpressionCategory = 'resting' | 'warm' | 'curious' | 'serious' | 'glitch';

export const expressionCategory: Record<ExpressionCode, ExpressionCategory> = {
  A1: 'resting', A2: 'resting', A3: 'resting', A4: 'resting',
  A5: 'warm', A6: 'warm', A7: 'warm', A8: 'warm', A9: 'warm',
  A10: 'curious', A11: 'curious', A12: 'curious',
  A13: 'serious', A14: 'serious', A15: 'serious', A16: 'serious', A17: 'serious', A18: 'serious',
  A19: 'glitch',
};

// ============================================================================
// Default gaze per expression (overridable by the model)
// ============================================================================

export const defaultGaze: Partial<Record<ExpressionCode, GazeCode>> = {
  A3: 'G2',   // thoughtful → looking away
  A14: 'G2',  // hesitant → looking sideways
  A15: 'G3',  // sad → looking down
};

export function getRigState(expression: ExpressionCode, gaze?: GazeCode): RigState {
  const base = rigStates[expression];
  const activeGaze = gaze || defaultGaze[expression] || 'G1';
  return applyGaze(base, activeGaze);
}
