// Decorative SVG pieces: a slowly turning mandala, twinkling stars, a small lotus mark.
// Everything is aria-hidden: it carries no information.

// Same star positions on every render (no Math.random during render).
const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 97.13 + n * 31.7) * 10000;
    return x - Math.floor(x);
  };
  return { x: r(1) * 100, y: r(2) * 100, size: 1 + r(3) * 2, delay: r(4) * 6, dur: 3 + r(5) * 4 };
});

export function Stars() {
  return (
    <div className="stars" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

const angles = (count: number) => Array.from({ length: count }, (_, i) => (360 / count) * i);

// Two stacked SVGs: the outer ring turns one way, the inner rings turn the other way.
export function Mandala({ className = "" }: { className?: string }) {
  return (
    <div className={`mandala ${className}`} aria-hidden="true">
      <svg className="mandala-layer mandala-outer" viewBox="-250 -250 500 500" fill="none">
        <circle r="244" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" opacity=".7" />
        {angles(24).map((a) => (
          <path
            key={a}
            transform={`rotate(${a})`}
            d="M0 -190 Q 15 -214 0 -238 Q -15 -214 0 -190Z"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity=".85"
          />
        ))}
        <circle r="186" stroke="currentColor" strokeWidth="1.2" opacity=".8" />
        {angles(16).map((a) => (
          <path
            key={a}
            transform={`rotate(${a})`}
            d="M0 -122 C 40 -142 40 -172 0 -180 C -40 -172 -40 -142 0 -122Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        ))}
      </svg>

      <svg className="mandala-layer mandala-inner" viewBox="-250 -250 500 500" fill="none">
        <circle r="116" stroke="currentColor" strokeWidth="1.2" opacity=".8" />
        {angles(12).map((a) => (
          <path
            key={a}
            transform={`rotate(${a + 15})`}
            d="M0 -58 C 26 -76 26 -102 0 -112 C -26 -102 -26 -76 0 -58Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        ))}
        <circle r="58" stroke="currentColor" strokeWidth="1.2" opacity=".9" />
        {angles(8).map((a) => (
          <path
            key={a}
            transform={`rotate(${a})`}
            d="M0 -16 C 14 -28 14 -44 0 -54 C -14 -44 -14 -28 0 -16Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        ))}
        <circle r="9" fill="currentColor" />
      </svg>
      <div className="mandala-glow" />
    </div>
  );
}

export function Lotus({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" fill="none" aria-hidden="true">
      {[-60, -30, 0, 30, 60].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 4 C 6 -2 6 -10 0 -16 C -6 -10 -6 -2 0 4Z"
          fill="currentColor"
          opacity={a === 0 ? 1 : 0.6}
        />
      ))}
    </svg>
  );
}
