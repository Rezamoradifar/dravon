const STORAGE_KEY = "round-dashboard:voice-enabled:v1";

export function isVoiceEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function setVoiceEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new Event("round-dashboard:voice-changed"));
  } catch {
    // ignore quota / private-mode errors
  }
}

// Kept short and punchy on purpose - a long line reads slowly and robotically
// through SpeechSynthesis. Deliberately no promise-of-return language (e.g.
// "grow your wealth"), matching the no-ROI-language stance used everywhere
// else in the app - this is a congratulatory nudge, not a financial claim.
const WELCOME_LINES = [
  "Welcome aboard! Your journey starts right now. Stay sharp, stay consistent, and make it count.",
  "You're in! This is your moment. Show up, stay focused, and own it.",
  "Welcome to the network! The first step is done. Now go make it count.",
];

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang === "en-US" && /female|zira|samantha|jenny/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang?.startsWith("en"))
  );
}

/**
 * Speaks a short, energetic welcome line via the browser's built-in
 * SpeechSynthesis API - no audio files to host, works offline, and respects
 * the user's voice-feedback preference. Never throws: unsupported browsers
 * and blocked autoplay policies just silently no-op.
 */
export function speakWelcome() {
  if (typeof window === "undefined") return;
  if (!isVoiceEnabled()) return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  try {
    synth.cancel(); // don't stack onto any lingering utterance
    const line = WELCOME_LINES[Math.floor(Math.random() * WELCOME_LINES.length)];
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const voice = pickEnglishVoice(synth.getVoices());
    if (voice) utterance.voice = voice;

    synth.speak(utterance);
  } catch {
    // SpeechSynthesis unsupported/blocked - silently no-op
  }
}
