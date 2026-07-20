import { applyMove, getLegalMoves } from "./engine";
import type { GameState, Move, Player } from "./types";

function pointOwner(state: GameState, point: number) {
  if (point < 1 || point > 24) return null;
  return state.points[point - 1];
}

/**
 * A lightweight heuristic scorer, not a full search - good enough for a casual
 * free single-player opponent: bear off > hit a blot > make/reinforce a point
 * > avoid leaving a new blot > otherwise prefer advancing the back-most checker.
 */
function scoreMove(state: GameState, player: Player, move: Move): number {
  let score = 0;

  if (move.to === null) {
    score += 1000;
    return score;
  }

  const dest = pointOwner(state, move.to);
  if (dest && dest.owner && dest.owner !== player && dest.count === 1) {
    score += 500;
  }

  if (dest && dest.owner === player) {
    score += 200;
  } else {
    // Landing alone creates a new blot - mildly penalize it.
    score -= 80;
  }

  if (move.source.type === "point") {
    // Prefer moving the checker that's furthest from home (more urgent to advance).
    const progress = player === "white" ? 24 - move.source.point : move.source.point;
    score += progress * 0.5;
  } else {
    score += 300; // entering from the bar is always a priority
  }

  return score;
}

export function chooseAiMove(state: GameState, player: Player): Move | null {
  const candidates = getLegalMoves(state, player);
  if (candidates.length === 0) return null;

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const move of candidates) {
    const score = scoreMove(state, player, move);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

/** Plays every remaining die for `player`, one heuristic move at a time. Returns the resulting state. */
export function playAiTurn(state: GameState, player: Player): GameState {
  let current = state;
  while (current.dice.length > 0 && !current.winner) {
    const move = chooseAiMove(current, player);
    if (!move) break;
    current = applyMove(current, move);
  }
  return current;
}
