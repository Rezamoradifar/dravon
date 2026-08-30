"use client";

import * as React from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

const COLORS = ["#3EFFE9", "#3EFFE9", "#3EFFE9", "#4880FF", "#9C48FF"];
const LINK_DIST = 150;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * A live node-network animation for the futuristic hero: faint connecting lines
 * between nearby nodes, and small pulses of "data" traveling along a subset of
 * them. Deterministically seeded so it never looks the same twice per session
 * but never jumps between renders. Skips the animation loop entirely under
 * prefers-reduced-motion, drawing one static frame instead.
 */
export function NetworkCanvas({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = seededRandom(4242);
    let nodes: Node[] = [];
    let pulses: { from: Node; to: Node; t: number }[] = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let frameId = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(24, Math.round((width * height) / 18000));
      nodes = Array.from({ length: count }, () => ({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 0.15,
        vy: (rand() - 0.5) * 0.15,
        r: rand() * 1.6 + 0.8,
        color: COLORS[Math.floor(rand() * COLORS.length)],
      }));
      pulses = Array.from({ length: Math.round(count / 5) }, () => {
        const from = nodes[Math.floor(rand() * nodes.length)];
        const to = nodes[Math.floor(rand() * nodes.length)];
        return { from, to, t: rand() };
      });
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);

      // Links between nearby nodes.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx!.strokeStyle = `rgba(62, 255, 233, ${0.12 * (1 - dist / LINK_DIST)})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Nodes.
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.fillStyle = n.color;
        ctx!.globalAlpha = 0.85;
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }

      // Traveling data pulses along a subset of edges.
      if (!reduceMotion) {
        for (const p of pulses) {
          const x = p.from.x + (p.to.x - p.from.x) * p.t;
          const y = p.from.y + (p.to.y - p.from.y) * p.t;
          ctx!.beginPath();
          ctx!.fillStyle = "#3EFFE9";
          ctx!.shadowColor = "#3EFFE9";
          ctx!.shadowBlur = 6;
          ctx!.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.shadowBlur = 0;
        }
      }
    }

    function tick() {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      for (const p of pulses) {
        p.t += 0.004;
        if (p.t > 1) {
          p.t = 0;
          p.from = nodes[Math.floor(rand() * nodes.length)];
          p.to = nodes[Math.floor(rand() * nodes.length)];
        }
      }
      drawFrame();
      frameId = requestAnimationFrame(tick);
    }

    resize();
    drawFrame();
    if (!reduceMotion) frameId = requestAnimationFrame(tick);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
