"use client";

/**
 * Tiny self-contained sound effects via the Web Audio API - no audio files to
 * ship or host, consistent with this app's other self-contained effects
 * (lib/confetti.ts uses canvas the same way). Synthesizes short tones per
 * event instead of playing recorded samples.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(freq: number, durationMs: number, delayMs = 0, type: OscillatorType = "sine", gain = 0.06) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const startAt = ctx.currentTime + delayMs / 1000;
    g.gain.setValueAtTime(gain, startAt);
    g.gain.exponentialRampToValueAtTime(0.001, startAt + durationMs / 1000);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + durationMs / 1000 + 0.02);
  } catch {
    // Web Audio unsupported/blocked - silently no-op, same as haptics.
  }
}

const SOUND_KEY = "round-dashboard:backgammon-sound-enabled:v1";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(SOUND_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function playSound(event: "roll" | "move" | "hit" | "bearOff" | "win" | "noMoves") {
  if (!isSoundEnabled()) return;
  switch (event) {
    case "roll":
      tone(180, 70, 0, "triangle", 0.05);
      tone(220, 70, 60, "triangle", 0.05);
      tone(260, 90, 120, "triangle", 0.05);
      break;
    case "move":
      tone(440, 70, 0, "sine", 0.05);
      break;
    case "hit":
      tone(180, 60, 0, "sawtooth", 0.08);
      tone(120, 120, 40, "sawtooth", 0.06);
      break;
    case "bearOff":
      tone(520, 90, 0, "sine", 0.06);
      tone(660, 110, 70, "sine", 0.06);
      break;
    case "win":
      tone(523, 120, 0, "sine", 0.07);
      tone(659, 120, 110, "sine", 0.07);
      tone(784, 220, 220, "sine", 0.07);
      break;
    case "noMoves":
      tone(160, 160, 0, "sine", 0.04);
      break;
  }
}
