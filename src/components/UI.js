import React from 'react';
import { badgeStyle } from '../utils';

// ── Pill Badge ──────────────────────────────────────────────
export function Badge({ pct, label }) {
  const s = badgeStyle(pct);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 700, padding: '4px 12px',
      borderRadius: 20, fontFamily: 'var(--font-mono)',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {label || `${pct}% smaller`}
    </span>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
export function ProgressBar({ value, label, accent = '#c8f53b' }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        height: 3, background: 'var(--bg3)',
        borderRadius: 2, overflow: 'hidden', marginBottom: 8,
      }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: accent, borderRadius: 2,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${accent}88`,
        }} />
      </div>
      {label && (
        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          {label}
        </p>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────
export function Stat({ value, label, accent }) {
  return (
    <div style={{
      background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
      padding: '14px 12px', textAlign: 'center',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontSize: 20, fontWeight: 800, lineHeight: 1.2,
        color: accent || 'var(--text)', fontFamily: 'var(--font-mono)',
        letterSpacing: '-0.5px',
      }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

// ── Size Bar ──────────────────────────────────────────────
export function SizeBar({ origSize, compSize, accent = '#c8f53b' }) {
  const pct = Math.max(4, 100 - Math.round((1 - compSize / origSize) * 100));
  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
        <span>Before</span><span>After</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--border2)' }} />
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`, background: accent, borderRadius: 3,
          boxShadow: `0 0 10px ${accent}66`,
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

// ── Status Banner ──────────────────────────────────────────────
export function StatusBanner({ type = 'info', children }) {
  const styles = {
    info:  { bg: 'rgba(59,245,212,0.07)', border: 'rgba(59,245,212,0.2)', color: '#3bf5d4' },
    warn:  { bg: 'rgba(245,162,59,0.07)', border: 'rgba(245,162,59,0.2)', color: '#f5a23b' },
    error: { bg: 'rgba(245,59,110,0.07)', border: 'rgba(245,59,110,0.2)', color: '#f53b6e' },
    success: { bg: 'rgba(200,245,59,0.07)', border: 'rgba(200,245,59,0.2)', color: '#c8f53b' },
  };
  const s = styles[type];
  return (
    <div style={{
      marginTop: 14, padding: '10px 14px', borderRadius: 'var(--radius-xs)',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: 12, lineHeight: 1.6, fontFamily: 'var(--font-mono)',
    }}>
      {children}
    </div>
  );
}

// ── Button ──────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 24px', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    transition: 'var(--transition)', opacity: disabled ? 0.4 : 1,
    ...style,
  };
  const variants = {
    primary: { background: '#c8f53b', color: '#000' },
    secondary: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)' },
    ghost: { background: 'transparent', color: 'var(--text3)', border: '1px solid var(--border)' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

// ── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 16, color = '#000' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

// ── Slider Control ──────────────────────────────────────────────
export function SliderControl({ label, value, displayValue, min, max, step = 1, onChange, leftLabel, rightLabel }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)' }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#c8f53b', fontWeight: 500 }}>{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%' }}
        className="squeeze-slider"
      />
      {(leftLabel || rightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          <span>{leftLabel}</span><span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

// ── Toggle ──────────────────────────────────────────────
export function Toggle({ label, sub, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
      </div>
      <label style={{ position: 'relative', width: 42, height: 24, flexShrink: 0, cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 12, transition: 'background 0.2s',
          background: checked ? '#c8f53b' : 'var(--bg3)',
          border: `1px solid ${checked ? '#c8f53b' : 'var(--border2)'}`,
        }}>
          <span style={{
            position: 'absolute', width: 18, height: 18, borderRadius: '50%', top: 2,
            left: checked ? 20 : 2, transition: 'left 0.2s',
            background: checked ? '#000' : 'var(--text3)',
          }} />
        </span>
      </label>
    </div>
  );
}

// ── Drop Zone ──────────────────────────────────────────────
export function DropZone({ onFile, accept, multiple = false, icon, title, sub, formats, accentColor = '#c8f53b' }) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef();

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    const files = multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]];
    if (files[0]) onFile(multiple ? files : files[0]);
  }

  function handleInput(e) {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0];
    if (files) onFile(files);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? accentColor : 'var(--border2)'}`,
        borderRadius: 'var(--radius)', background: dragging ? `${accentColor}08` : 'var(--bg1)',
        padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
        transition: 'var(--transition)', position: 'relative',
      }}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleInput} style={{ display: 'none' }} />
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>{sub}</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {formats.map(f => (
          <span key={f} style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            border: '1px solid var(--border2)', color: 'var(--text3)',
            fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{f}</span>
        ))}
      </div>
    </div>
  );
}

// ── File Info Row ──────────────────────────────────────────────
export function FileInfoRow({ name, meta, emoji, onClear }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 46, height: 46, borderRadius: 10, background: 'var(--bg2)',
        border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{meta}</div>
      </div>
      {onClear && (
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, padding: '4px 8px', borderRadius: 6 }}>✕</button>
      )}
    </div>
  );
}

// Inject slider + spin CSS
const style = document.createElement('style');
style.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
.squeeze-slider {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 3px; background: var(--bg3); border-radius: 2px; outline: none; cursor: pointer;
}
.squeeze-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: #c8f53b; cursor: pointer; box-shadow: 0 0 0 3px rgba(200,245,59,0.15);
}
.squeeze-slider::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%; background: #c8f53b; cursor: pointer; border: none;
}
`;
document.head.appendChild(style);
