"use client";

import React, { useEffect, useRef, memo } from "react";
import { VoiceActivityState } from "../../types/inspection";

interface VoiceParticlesProps {
  state: VoiceActivityState;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  angle: number;
  color: string;
}

export const VoiceParticles = memo(function VoiceParticles({
  state,
  className = "",
}: VoiceParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<VoiceActivityState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 340);
    let height = (canvas.height = canvas.offsetHeight || 340);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 340;
      height = canvas.height = canvas.offsetHeight || 340;
    };

    window.addEventListener("resize", handleResize);

    // Warm culinary colors: Muted olive green & warm amber
    const colors = [
      "rgba(46, 79, 50, ",    // Laurel green
      "rgba(192, 122, 29, ",  // Warm amber
      "rgba(68, 102, 71, ",   // Surface tint green
    ];

    const particleCount = 26; // Lightweight, never visually noisy
    const particles: Particle[] = [];

    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const dist = 55 + Math.random() * 85;
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        originX: centerX + Math.cos(angle) * dist,
        originY: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1.5 + Math.random() * 2,
        alpha: 0.18 + Math.random() * 0.25,
        angle,
        color: colors[i % colors.length],
      });
    }

    if (prefersReducedMotion) {
      // Draw static particles once without continuous RAF loop
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.02;

      const currentState = stateRef.current;

      // Speed and expansion multipliers based on state
      let speedMult = 0.4;
      let waveAmp = 2;

      if (currentState === "listening") {
        speedMult = 0.9;
        waveAmp = 5;
      } else if (currentState === "processing") {
        speedMult = 1.1;
        waveAmp = 3.5;
      } else if (currentState === "speaking") {
        speedMult = 0.7;
        waveAmp = 8; // Gentle breathing expansion
      } else if (currentState === "complete") {
        speedMult = 0.2;
        waveAmp = 1;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (currentState === "processing") {
          // Circular orbital motion
          p.angle += 0.012 * speedMult;
          const currentDist = 65 + (i % 3) * 25 + Math.sin(t + i) * waveAmp;
          p.x = centerX + Math.cos(p.angle) * currentDist;
          p.y = centerY + Math.sin(p.angle) * currentDist;
        } else if (currentState === "speaking") {
          // Radial pulse wave
          const pulse = Math.sin(t * 1.5 + i * 0.2) * waveAmp;
          const dist = 60 + (i % 4) * 20 + pulse;
          p.x = centerX + Math.cos(p.angle) * dist;
          p.y = centerY + Math.sin(p.angle) * dist;
        } else {
          // Organic calm floating
          p.x += p.vx * speedMult;
          p.y += p.vy * speedMult;

          // Soft boundary bounce around center ring
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 135 || dist < 45) {
            p.vx *= -1;
            p.vy *= -1;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
        state === "idle" ? "opacity-40" : "opacity-90"
      } ${className}`}
    />
  );
});
