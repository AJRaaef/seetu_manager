import React, { useEffect, useRef } from 'react';

const COLORS = [
  '#0097B2', '#0F2F3D', '#F59E0B', '#10B981',
  '#8B5CF6', '#EC4899', '#3B82F6', '#EF4444', '#14B8A6'
];

/**
 * Pure React + HTML5 Canvas Confetti Component
 * Zero external dependencies, 100% CSP-safe (zero eval), fast & lightweight.
 */
const Confetti = ({
  width = typeof window !== 'undefined' ? window.innerWidth : 800,
  height = typeof window !== 'undefined' ? window.innerHeight : 600,
  recycle = false,
  numberOfPieces = 300,
  gravity = 0.25,
  style = {}
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let w = (canvas.width = width);
    let h = (canvas.height = height);

    const handleResize = () => {
      if (canvas) {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const particles = [];
    for (let i = 0; i < numberOfPieces; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h - h,
        size: Math.random() * 8 + 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        tilt: Math.random() * 10 - 5,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleIncremental: (Math.random() * 0.08) + 0.04
      });
    }

    let active = true;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      let remaining = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.tiltAngle) + p.vy + gravity * 2);
        p.x += Math.sin(p.tiltAngle) * 2 + p.vx;
        p.rotation += p.rotationSpeed;

        if (p.y <= h + 30) {
          remaining++;
        } else if (recycle) {
          p.x = Math.random() * w;
          p.y = -20;
          p.vy = Math.random() * 3 + 2;
          remaining++;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        // Draw confetti rectangle
        ctx.beginPath();
        const halfSize = p.size / 2;
        ctx.rect(-halfSize, -halfSize / 2, p.size, p.size * 0.6);
        ctx.fill();
        ctx.restore();
      }

      if (remaining > 0 && active) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height, recycle, numberOfPieces, gravity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        ...style
      }}
    />
  );
};

export default Confetti;
