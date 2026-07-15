interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
}

const COLORS = [
  "hsl(244 75% 59%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 70% 60%)",
  "hsl(0 84% 60%)",
];

/** Lightweight canvas confetti burst - no external dependency, self-removing. */
export function fireConfetti(particleCount = 90) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const particles: Particle[] = Array.from({ length: particleCount }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 120,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 7 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  const gravity = 0.35;
  const drag = 0.985;
  let frame = 0;
  const maxFrames = 130;
  let rafId: number;

  function tick() {
    if (!ctx) return;
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      const opacity = frame > maxFrames - 30 ? Math.max(0, (maxFrames - frame) / 30) : 1;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (frame < maxFrames) {
      rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafId);
      canvas.remove();
    }
  }

  rafId = requestAnimationFrame(tick);
}
