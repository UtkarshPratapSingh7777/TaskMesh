import { useEffect, useRef } from 'react';

const ORB_COLORS = [
  [99, 102, 241],
  [139, 92, 246],
  [6, 182, 212],
  [236, 72, 153]
];

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf = 0;
    const particles = [];
    const orbs = ORB_COLORS.map((color, index) => ({
      color,
      x: 0.2 + index * 0.2,
      y: 0.15 + (index % 2) * 0.35,
      radius: 180 + index * 40,
      speed: 0.0004 + index * 0.00015,
      phase: index * 1.4
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function seedParticles() {
      particles.length = 0;
      const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 14000));
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }

    function drawOrbs() {
      for (const orb of orbs) {
        const cx = canvas.width * (orb.x + Math.sin(frame * orb.speed + orb.phase) * 0.12);
        const cy = canvas.height * (orb.y + Math.cos(frame * orb.speed * 1.3 + orb.phase) * 0.1);
        const [r, g, b] = orb.color;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.radius);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.22)`);
        gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.08)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawParticles() {
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) {
          p.vx *= -1;
        }
        if (p.y < 0 || p.y > canvas.height) {
          p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 255, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function paint() {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#07070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawOrbs();
      drawParticles();
      raf = window.requestAnimationFrame(paint);
    }

    resize();
    seedParticles();
    paint();

    const onResize = () => {
      resize();
      seedParticles();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
