export type ExpressionCode =
  | 'A1' | 'A2' | 'A3' | 'A4'
  | 'A5' | 'A6' | 'A7' | 'A8' | 'A9'
  | 'A10' | 'A11' | 'A12'
  | 'A13' | 'A14' | 'A15' | 'A16' | 'A17' | 'A18';

export type GazeCode = 'G1' | 'G2' | 'G3';

export const EXPRESSION_CODES: ExpressionCode[] = [
  'A1', 'A2', 'A3', 'A4',
  'A5', 'A6', 'A7', 'A8', 'A9',
  'A10', 'A11', 'A12',
  'A13', 'A14', 'A15', 'A16', 'A17', 'A18',
];

export const GAZE_CODES: GazeCode[] = ['G1', 'G2', 'G3'];

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AvatarResponse {
  dialogue: string;
  expression: ExpressionCode;
  gaze: GazeCode;
}
