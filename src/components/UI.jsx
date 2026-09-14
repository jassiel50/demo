import React from 'react';

export function StatCard({ label, value, sub, tone = 'navy' }) {
  return (
    <div className={'stat-card c-' + tone}>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value" style={typeof value === 'string' && value.length > 8 ? { fontSize: '1.35rem' } : undefined}>
        {value}
      </h3>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

export function Chip({ tone = 'gray', children }) {
  return <span className={'chip chip-' + tone}>{children}</span>;
}

export function Avatar({ name, size }) {
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="avatar-chip" style={size ? { width: size, height: size, fontSize: size * 0.32 } : undefined}>
      {initials}
    </div>
  );
}

export function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined">{icon}</span>
      <p>{message}</p>
    </div>
  );
}

export function DonutChart({ data, centerLabel, size = 180 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const cx = size / 2, cy = size / 2, r = size * 0.4, hole = size * 0.233;
  if (total === 0) {
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} />;
  }
  let angle = -Math.PI / 2;
  const multi = data.filter((d) => d.count > 0).length > 1;
  const paths = [];
  data.forEach((d, i) => {
    if (d.count <= 0) return;
    const sweep = (2 * Math.PI * d.count) / total;
    const end = angle + sweep - (multi ? 0.014 : 0);
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const ix1 = cx + hole * Math.cos(angle), iy1 = cy + hole * Math.sin(angle);
    const ix2 = cx + hole * Math.cos(end), iy2 = cy + hole * Math.sin(end);
    const lg = sweep > Math.PI ? 1 : 0;
    paths.push(
      <path
        key={i}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${hole} ${hole} 0 ${lg} 0 ${ix1} ${iy1} Z`}
        fill={d.color}
      />
    );
    angle += sweep;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <circle cx={cx} cy={cy} r={hole} fill="#ffffff" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="900" fill="#171c1f" fontFamily="Manrope,sans-serif">
        {total}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Inter,sans-serif" letterSpacing="1">
        {centerLabel}
      </text>
    </svg>
  );
}

export function TrendBars({ columns }) {
  const max = Math.max(...columns.map((c) => c.value), 1);
  return (
    <div className="trend-bars">
      {columns.map((c, i) => {
        const h = Math.max(6, Math.round((c.value / max) * 130));
        return (
          <div className="trend-col" key={i}>
            <span className="trend-val">{c.display}</span>
            <div className="trend-bar" style={{ height: h + 'px' }} />
            <span className="trend-lbl">{c.label}</span>
          </div>
        );
      })}
    </div>
  );
}
