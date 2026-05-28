import React, { useState } from 'react';
import Auth from './Auth';
import TextTab from './components/TextTab';
import ImageTab from './components/ImageTab';
import VideoTab from './components/VideoTab';
import ZipTab from './components/ZipTab';

const TABS = [
  { id: 'text',  label: 'Text',  icon: '📄', accent: '#3bf5d4', desc: 'Huffman coding' },
  { id: 'image', label: 'Image', icon: '🖼',  accent: '#c8f53b', desc: 'JPEG / PNG re-encode' },
  { id: 'video', label: 'Video', icon: '🎬', accent: '#a855f7', desc: 'FFmpeg · libx264' },
  { id: 'zip',   label: 'ZIP',   icon: '📦', accent: '#f53b6e', desc: 'DEFLATE archive' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState('text');
  const tab = TABS.find(t => t.id === active);

  if (!user) return <Auth onLoggedIn={email => setUser(email)} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', height: 56,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
          <div style={{
            width: 30, height: 30, background: '#c8f53b', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>PiperShrink</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>File Compressor</div>
          </div>
        </div>

        {/* Desktop tabs */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="nav-tabs">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: active === t.id ? 'var(--bg2)' : 'transparent',
              color: active === t.id ? t.accent : 'var(--text3)',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'var(--transition)',
              outline: active === t.id ? `1px solid ${t.accent}33` : 'none',
            }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontSize: 10, fontFamily: 'var(--font-mono)',
            color: '#c8f53b', border: '1px solid rgba(200,245,59,0.25)',
            borderRadius: 20, padding: '3px 10px',
          }}>🔒 Private</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 12px',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#c8f53b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#0a0a0a',
            }}>
              {user[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user}</span>
            <button onClick={() => setUser(null)} style={{
              background: 'none', border: 'none', color: 'var(--text3)',
              fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer',
              padding: '0 0 0 4px', transition: 'color 0.2s',
            }}>Sign out</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ padding: '3rem 1.5rem 0', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontFamily: 'var(--font-mono)', color: tab.accent,
            border: `1px solid ${tab.accent}33`, borderRadius: 20,
            padding: '4px 12px', marginBottom: 16, background: `${tab.accent}0d`,
          }}>
            <span>{tab.icon}</span> {tab.desc}
          </div>
          <h1 style={{ fontSize: 'clamp(32px,7vw,56px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '0.75rem' }}>
            Compress files<br />
            <span style={{ color: tab.accent, textShadow: `0 0 40px ${tab.accent}44`, transition: 'color 0.3s, text-shadow 0.3s' }}>instantly.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 520, fontFamily: 'var(--font-mono)' }}>
            Text, images, video, archives — all processed in your browser.<br />
            No uploads. No server. Files never leave your device.
          </p>
        </div>

        {/* Mobile tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: '1.5rem', background: 'var(--bg1)', borderRadius: 'var(--radius)', padding: 5, border: '1px solid var(--border)' }} className="mobile-tabs">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 4px', border: 'none', borderRadius: 10,
              background: active === t.id ? 'var(--bg3)' : 'transparent',
              color: active === t.id ? t.accent : 'var(--text3)',
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'var(--transition)',
              outline: active === t.id ? `1px solid ${t.accent}33` : 'none',
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{
          background: 'var(--bg1)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '3rem',
          boxShadow: `0 0 0 1px ${tab.accent}0a, 0 24px 48px rgba(0,0,0,0.4)`,
          transition: 'box-shadow 0.3s',
        }}>
          {active === 'text'  && <TextTab />}
          {active === 'image' && <ImageTab />}
          {active === 'video' && <VideoTab />}
          {active === 'zip'   && <ZipTab />}
        </div>

        {/* How it works */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
            Under the hood
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
            {[
              { icon: '📄', title: 'Huffman Coding', body: 'Assigns shorter bit-codes to frequent characters. Same algorithm inside ZIP, PNG, MP3.', accent: '#3bf5d4' },
              { icon: '🖼', title: 'Canvas Re-encoding', body: "Draws the image at your chosen quality using the browser's native C++ JPEG encoder.", accent: '#c8f53b' },
              { icon: '🎬', title: 'FFmpeg via WASM', body: 'Real FFmpeg compiled to WebAssembly. Same libx264 codec used by YouTube and Netflix.', accent: '#a855f7' },
              { icon: '📦', title: 'DEFLATE / ZIP', body: 'LZ77 sliding-window + Huffman. Standard ZIP format, compatible with every OS and app.', accent: '#f53b6e' },
            ].map(c => (
              <div key={c.title} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: c.accent }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>{c.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', paddingBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            PiperShrink · Built with Web APIs · No server · 100% private
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['🔒 Private', '⚡ Instant', '📱 Mobile-ready'].map(b => (
              <span key={b} style={{ fontSize: 11, color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-mono)' }}>{b}</span>
            ))}
          </div>
        </footer>
      </div>

      <style>{`
        .nav-tabs { display: flex; }
        .mobile-tabs { display: none; }
        @media (max-width: 600px) {
          .nav-tabs { display: none !important; }
          .mobile-tabs { display: grid !important; }
        }
      `}</style>
    </div>
  );
}
