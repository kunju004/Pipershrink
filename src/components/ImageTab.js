import React, { useState, useRef } from 'react';
import { fmtSize, savingsPct, triggerDownload, stemName } from '../utils';
import { DropZone, FileInfoRow, SliderControl, Btn, Spinner, ProgressBar, Stat, SizeBar, StatusBanner, Badge } from './UI';

const RESIZE_WIDTHS = [0, 1920, 1280, 800, 480];
const RESIZE_LABELS = ['Original', '1920px', '1280px', '800px', '480px'];

export default function ImageTab() {
  const [file, setFile] = useState(null);
  const [origUrl, setOrigUrl] = useState(null);
  const [quality, setQuality] = useState(80);
  const [resizeIdx, setResizeIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, label: '' });
  const [result, setResult] = useState(null);
  const [blob, setBlob] = useState(null);
  const [compUrl, setCompUrl] = useState(null);

  function handleFile(f) {
    setFile(f); setResult(null); setBlob(null); setCompUrl(null);
    setOrigUrl(URL.createObjectURL(f));
  }

  function compress() {
    if (!file) return;
    setBusy(true); setResult(null);
    setProgress({ value: 10, label: 'Loading image…' });

    const maxW = RESIZE_WIDTHS[+resizeIdx];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setProgress({ value: 40, label: 'Drawing to canvas…' });
      let w = img.naturalWidth, h = img.naturalHeight;
      if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }

      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      setProgress({ value: 70, label: 'Re-encoding…' });
      const isJpeg = file.type !== 'image/png';
      const mime = isJpeg ? 'image/jpeg' : 'image/png';

      canvas.toBlob(outBlob => {
        if (!outBlob) { setBusy(false); return; }
        setProgress({ value: 100, label: 'Done!' });
        const cUrl = URL.createObjectURL(outBlob);
        setBlob(outBlob);
        setCompUrl(cUrl);
        const pct = savingsPct(file.size, outBlob.size);
        const ext = isJpeg ? 'jpg' : 'png';
        setResult({ origSize: file.size, compSize: outBlob.size, pct, w, h, fname: stemName(file.name) + '_compressed.' + ext });
        setBusy(false);
      }, mime, +quality / 100);
    };
    img.onerror = () => setBusy(false);
    img.src = url;
  }

  function reset() { setFile(null); setOrigUrl(null); setResult(null); setBlob(null); setCompUrl(null); setBusy(false); }

  return (
    <div>
      {!file ? (
        <DropZone
          icon="🖼" title="Drop your image" sub="JPEG, PNG, WebP, GIF — processed in your browser"
          formats={['jpg', 'jpeg', 'png', 'webp', 'gif']}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onFile={handleFile} accentColor="#c8f53b"
        />
      ) : (
        <div>
          <FileInfoRow name={file.name} meta={`${fmtSize(file.size)} · ${file.type}`} emoji="🖼" onClear={reset} />

          {/* Thumb preview */}
          {origUrl && (
            <div style={{ marginBottom: 20, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: 160 }}>
              <img src={origUrl} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          <SliderControl label="Quality" value={quality} displayValue={`${quality}%`} min={10} max={95} step={5} onChange={setQuality} leftLabel="Smallest file" rightLabel="Best quality" />
          <SliderControl label="Max Width" value={resizeIdx} displayValue={RESIZE_LABELS[+resizeIdx]} min={0} max={4} onChange={setResizeIdx} leftLabel="Original" rightLabel="480px" />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn onClick={compress} disabled={busy}>
              {busy ? <><Spinner />&nbsp;Compressing…</> : '⚡ Compress'}
            </Btn>
            <Btn variant="ghost" onClick={reset} style={{ padding: '12px 16px', fontSize: 12 }}>Clear</Btn>
          </div>

          {busy && <ProgressBar value={progress.value} label={progress.label} accent="#c8f53b" />}

          {result && (
            <div style={{ marginTop: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Image compressed ✓</span>
                <Badge pct={result.pct} />
              </div>

              {/* Before / After */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[{ url: origUrl, label: 'Original', size: result.origSize }, { url: compUrl, label: 'Compressed', size: result.compSize }].map(({ url, label, size }) => (
                  <div key={label} style={{ borderRadius: 'var(--radius-xs)', overflow: 'hidden', position: 'relative', background: 'var(--bg3)' }}>
                    <img src={url} alt={label} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', fontSize: 10, padding: '3px 8px', fontFamily: 'var(--font-mono)' }}>
                      {label} · {fmtSize(size)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 4 }}>
                <Stat value={`${result.w}×${result.h}`} label="Dimensions" />
                <Stat value={fmtSize(result.compSize)} label="Output" accent="#c8f53b" />
                <Stat value={`${result.pct}%`} label="Smaller" accent="#c8f53b" />
              </div>
              <SizeBar origSize={result.origSize} compSize={result.compSize} accent="#c8f53b" />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <Btn onClick={() => triggerDownload(blob, result.fname)}>⬇ Download Image</Btn>
              </div>
              {result.pct < 5 && (
                <StatusBanner type="warn">
                  Minimal savings — image already optimised. Try quality 50–70% for bigger reductions.
                </StatusBanner>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
