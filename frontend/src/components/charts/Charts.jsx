// Lightweight inline-SVG charts. No deps. Render-only — pass plain numbers.
// Each chart accepts a className for sizing.

function buildPath(values, w, h, pad = 4, smooth = true) {
  if (!values?.length) return { line: '', area: '' };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / Math.max(1, values.length - 1);
  const points = values.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - pad * 2)]);
  if (!smooth || points.length < 3) {
    const line = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    const area = `${line} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;
    return { line, area, points };
  }
  // Catmull–Rom-ish smoothing
  let line = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const t = 0.18;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    line += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  const area = `${line} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;
  return { line, area, points };
}

export function Sparkline({ data, color = '#243e68', className = 'w-24 h-8', strokeWidth = 1.6, fill = true }) {
  const w = 96, h = 28;
  const { line, area } = buildPath(data, w, h, 2);
  const id = `sp-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AreaChart({
  series,
  labels = [],
  height = 220,
  yTicks = 4,
  showGrid = true,
  showAxis = true,
  formatY = (v) => v,
  className = 'w-full',
}) {
  const w = 800, h = height, padL = 40, padR = 16, padT = 16, padB = showAxis ? 28 : 8;
  const all = series.flatMap((s) => s.data);
  const min = Math.min(0, ...all);
  const max = Math.max(...all, 1);
  const range = max - min || 1;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xStep = innerW / Math.max(1, (series[0]?.data.length || 1) - 1);

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = min + (range * i) / yTicks;
    const y = padT + innerH - ((v - min) / range) * innerH;
    return { v, y };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" role="img">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`ac-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.color} stopOpacity="0.28" />
            <stop offset="1" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {showGrid && ticks.map((t, i) => (
        <line key={i} x1={padL} x2={w - padR} y1={t.y} y2={t.y} stroke="rgba(13,27,52,0.06)" strokeDasharray="2 4" />
      ))}
      {showAxis && ticks.map((t, i) => (
        <text key={i} x={padL - 8} y={t.y + 3} textAnchor="end"
          className="fill-graphite-400 text-[10px] num">{formatY(t.v)}</text>
      ))}
      {series.map((s, idx) => {
        const points = s.data.map((v, i) => [padL + i * xStep, padT + innerH - ((v - min) / range) * innerH]);
        let line = `M${points[0][0]},${points[0][1]}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i - 1] || points[i];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + 2] || p2;
          const t = 0.18;
          line += ` C${p1[0] + (p2[0] - p0[0]) * t},${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t},${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]},${p2[1]}`;
        }
        const area = `${line} L${points[points.length - 1][0]},${padT + innerH} L${points[0][0]},${padT + innerH} Z`;
        return (
          <g key={idx}>
            {s.fill !== false && <path d={area} fill={`url(#ac-${idx})`} />}
            <path d={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {showAxis && labels.map((lbl, i) => {
        const x = padL + i * xStep;
        return (
          <text key={i} x={x} y={h - 8} textAnchor="middle"
            className="fill-graphite-400 text-[10px]">{lbl}</text>
        );
      })}
    </svg>
  );
}

export function BarChart({ data, labels = [], color = '#243e68', height = 200, formatY = (v) => v, className = 'w-full' }) {
  const w = 800, h = height, padL = 36, padR = 12, padT = 12, padB = 26;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(...data, 1);
  const slot = innerW / data.length;
  const barW = slot * 0.55;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" role="img">
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={padL} x2={w - padR}
          y1={padT + innerH * (1 - t)} y2={padT + innerH * (1 - t)}
          stroke="rgba(13,27,52,0.06)" strokeDasharray="2 4" />
      ))}
      {data.map((v, i) => {
        const barH = (v / max) * innerH;
        const x = padL + i * slot + (slot - barW) / 2;
        const y = padT + innerH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={color} opacity="0.92" />
            {labels[i] && (
              <text x={x + barW / 2} y={h - 8} textAnchor="middle"
                className="fill-graphite-400 text-[10px]">{labels[i]}</text>
            )}
          </g>
        );
      })}
      {[0, 0.5, 1].map((t, i) => (
        <text key={i} x={padL - 8} y={padT + innerH * (1 - t) + 3} textAnchor="end"
          className="fill-graphite-400 text-[10px] num">{formatY(max * t)}</text>
      ))}
    </svg>
  );
}

export function DonutChart({ segments, size = 180, thickness = 22, centerLabel, centerValue }) {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let offset = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(13,27,52,0.06)" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={seg.color} strokeWidth={thickness}
              strokeDasharray={dash} strokeDashoffset={-offset}
              strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue && <div className="font-display text-xl font-semibold text-navy-900 num">{centerValue}</div>}
          {centerLabel && <div className="text-[11px] uppercase tracking-wider text-graphite-500 mt-0.5">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

export function ProgressArc({ value = 0, size = 80, thickness = 8, color = '#243e68', label }) {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const len = (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(13,27,52,0.08)" strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={`${len} ${c - len}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-navy-900 num">
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  );
}
