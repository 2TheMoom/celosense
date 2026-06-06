export function Logo({ size = 32 }: { size?: number }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const d = s * 0.46;

  const top = `${cx},${cy - d}`;
  const right = `${cx + d},${cy}`;
  const bottom = `${cx},${cy + d}`;
  const left = `${cx - d},${cy}`;

  const id = `${cx * 0.76},${cy * 0.76}`;
  const innerTop = `${cx},${cy - s * 0.35}`;
  const innerRight = `${cx + s * 0.35},${cy}`;
  const innerBottom = `${cx},${cy + s * 0.35}`;
  const innerLeft = `${cx - s * 0.35},${cy}`;

  const eyeRx = s * 0.2;
  const eyeRy = s * 0.11;

  const traceLen = s * 0.12;
  const nodeR = s * 0.055;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CeloSense logo"
    >
      {/* Outer diamond */}
      <polygon
        points={`${top} ${right} ${bottom} ${left}`}
        fill="none"
        stroke="#1F3A8F"
        strokeWidth={s * 0.055}
      />
      {/* Inner filled diamond */}
      <polygon
        points={`${innerTop} ${innerRight} ${innerBottom} ${innerLeft}`}
        fill="#1F3A8F"
      />
      {/* Eye white */}
      <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill="#E9E6DF" />
      {/* Green pupil */}
      <circle cx={cx} cy={cy} r={s * 0.07} fill="#1A6B3C" />

      {/* Circuit trace — top */}
      <line x1={cx} y1={cy - d} x2={cx} y2={cy - d - traceLen} stroke="#1F3A8F" strokeWidth={s * 0.04} strokeLinecap="round" />
      <line x1={cx - traceLen * 0.8} y1={cy - d - traceLen} x2={cx + traceLen * 0.8} y2={cy - d - traceLen} stroke="#1F3A8F" strokeWidth={s * 0.04} strokeLinecap="round" />
      <circle cx={cx - traceLen * 0.8} cy={cy - d - traceLen} r={nodeR} fill="#1A6B3C" />
      <circle cx={cx + traceLen * 0.8} cy={cy - d - traceLen} r={nodeR} fill="#1A6B3C" />

      {/* Circuit trace — bottom */}
      <line x1={cx} y1={cy + d} x2={cx} y2={cy + d + traceLen} stroke="#1F3A8F" strokeWidth={s * 0.04} strokeLinecap="round" />
      <line x1={cx - traceLen * 0.8} y1={cy + d + traceLen} x2={cx + traceLen * 0.8} y2={cy + d + traceLen} stroke="#1F3A8F" strokeWidth={s * 0.04} strokeLinecap="round" />
      <circle cx={cx - traceLen * 0.8} cy={cy + d + traceLen} r={nodeR} fill="#1A6B3C" />
      <circle cx={cx + traceLen * 0.8} cy={cy + d + traceLen} r={nodeR} fill="#1A6B3C" />

      {/* Scan lines */}
      <line x1={cx - d - s * 0.18} y1={cy} x2={cx - d - s * 0.04} y2={cy} stroke="#1F3A8F" strokeWidth={s * 0.04} strokeLinecap="round" />
      <line x1={cx + d + s * 0.04} y1={cy} x2={cx + d + s * 0.18} y2={cy} stroke="#1F3A8F" strokeWidth={s * 0.04} strokeLinecap="round" />
    </svg>
  );
}