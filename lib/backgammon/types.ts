export type Player = "white" | "black";

export interface PointState {
  /** null when the point is empty. */
  owner: Player | null;
  count: number;
}

export interface GameState {
  /** Index 0 = point 1 ... index 23 = point 24. */
  points: PointState[];
  bar: Record<Player, number>;
  borneOff: Record<Player, number>;
  turn: Player;
  /** Remaining die values still available to play this turn (doubles = four of the same value). */
  dice: number[];
  hasRolled: boolean;
  winner: Player | null;
  /** Log of the last roll shown to the player, kept even after dice are consumed. */
  lastRoll: number[];
}

export type MoveSource = { type: "bar" } | { type: "point"; point: number };

export interface Move {
  source: MoveSource;
  die: number;
  /** Destination point (1-24), or null when the move bears the checker off. */
  to: number | null;
}

export type GameMode = "ai" | "local";

export type Difficulty = "easy" | "medium" | "hard";
