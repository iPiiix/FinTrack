"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const isYellow = i < count / 2;
        particles.push({
          x: (Math.random() - 0.5) * canvas.width * 1.5,
          y: (Math.random() - 0.5) * canvas.height * 1.5,
          z: Math.random() * 2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          vz: 0,
          size: isYellow ? Math.random() * 2.5 + 0.5 : Math.random() * 1.5 + 0.3,
          opacity: isYellow ? Math.random() * 0.5 + 0.1 : Math.random() * 0.3 + 0.05,
          color: isYellow ? "#E8FF47" : "#ffffff",
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const cx = () => canvas.width / 2;
    const cy = () => canvas.height / 2;

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;

        // Wrap particles
        const hw = canvas.width * 0.75;
        const hh = canvas.height * 0.75;
        if (p.x > hw) p.x = -hw;
        if (p.x < -hw) p.x = hw;
        if (p.y > hh) p.y = -hh;
        if (p.y < -hh) p.y = hh;

        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.twinklePhase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(cx() + p.x, cy() + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Vignette
      const grad = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), Math.max(canvas.width, canvas.height) * 0.7);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "#09090B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    const onResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ display: "block" }}
    />
  );
}
