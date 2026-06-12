import { useEffect, useState } from 'react';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899', '#a5b4fc'];

export default function ConfettiBurst({ active, onDone }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const next = Array.from({ length: 64 }, (_, index) => ({
      id: index,
      left: 40 + Math.random() * 20,
      delay: Math.random() * 0.25,
      duration: 1.4 + Math.random() * 0.8,
      color: COLORS[index % COLORS.length],
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 180
    }));
    setPieces(next);

    const timer = window.setTimeout(() => {
      setPieces([]);
      onDone?.();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [active, onDone]);

  if (!pieces.length) {
    return null;
  }

  return (
    <div aria-hidden="true" className="confetti-layer">
      {pieces.map((piece) => (
        <span
          className="confetti-piece"
          key={piece.id}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate}deg)`,
            '--drift': `${piece.drift}px`
          }}
        />
      ))}
    </div>
  );
}
