import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  const isPercent = typeof value === 'string' && value.includes('%');

  useEffect(() => {
    if (isPercent) {
      setDisplay(value);
      previous.current = value;
      return undefined;
    }

    const from = Number(previous.current) || 0;
    const to = Number(value) || 0;
    if (from === to) {
      setDisplay(value);
      return undefined;
    }

    const start = performance.now();
    const duration = 600;
    let raf = 0;

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previous.current = to;
        setDisplay(to);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isPercent]);

  return <span className="counter-pop" key={String(value)}>{display}</span>;
}
