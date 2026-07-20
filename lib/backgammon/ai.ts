import { applyMove, getLegalMoves } from "./engine";
import type { Difficulty, GameState, Move, Player } from "./types";

function pointOwner(state: GameState, point: number) {
  if (point < 1 || point > 24) return null;
  return state.points[point - 1];
}

/** How many of the opponent's checkers could hit a blot left on `point` next turn (single die 1-6, or from the bar). */
function countThreats(state: GameState, player: Player, point: number): number {
  const opponent: Player = player === "white" ? "black" : "white";
  let threats = state.bar[opponent] > 0 ? state.bar[opponent] : 0;

  for (let p = 1; p <= 24; p++) {
    const ps = state.points[p - 1];
    if (ps.owner !== opponent) continue;
    const distance = opponent === "white" ? p - point : point - p;
    if (distance >= 1 && distance <= 6) threats += ps.count;
  }

  return threats;
}

/**
 * A lightweight heuristic scorer, not a full search - good enough for a casual
 * free single-player opponent: bear off > hit a blot > make/reinforce a point
 * > avoid leaving a new blot > otherwise prefer advancing the back-most checker.
 * "hard" additionally weighs a left-behind blot by how many opposing checkers
 * could actually hit it next turn, instead of a flat penalty.
 */
function scoreMove(state: GameState, player: Player, move: Move, difficulty: Difficulty): number {
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
  } else if (difficulty === "hard") {
    score -= countThreats(state, player, move.to) * 15;
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

export function chooseAiMove(state: GameState, player: Player, difficulty: Difficulty = "medium"): Move | null {
  const candidates = getLegalMoves(state, player);
  if (candidates.length === 0) return null;

  if (difficulty === "easy") {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const move of candidates) {
    const score = scoreMove(state, player, move, difficulty);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

/** Plays every remaining die for `player`, one heuristic move at a time. Returns the resulting state. */
export function playAiTurn(state: GameState, player: Player, difficulty: Difficulty = "medium"): GameState {
  let current = state;
  while (current.dice.length > 0 && !current.winner) {
    const move = chooseAiMove(current, player, difficulty);
    if (!move) break;
    current = applyMove(current, move);
  }
  return current;
}
