import React, { useState } from 'react';
import JSZip from 'jszip';
import { fmtSize, savingsPct, triggerDownload, fileEmoji } from '../utils';
import { DropZone, Btn, Spinner, ProgressBar, Stat, SizeBar, StatusBanner, Badge } from './UI';

export default function ZipTab() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, label: '' });
  const [result, setResult] = useState(null);
  const [blob, setBlob] = useState(null);
  const extraRef = React.useRef();

  function addFiles(incoming) {
    const arr = Array.from(incoming);
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...arr.filter(f => !existing.has(f.name + f.size))];
    });
    setResult(null); setBlob(null);
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  }

  async function createZip() {
    if (!files.length) return;
    setBusy(true); setResult(null);
    const zip = new JSZip();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress({ value: Math.round((i / files.length) * 70), label: `Adding ${f.name}…` });
      zip.file(f.name, await f.arrayBuffer());
      await new Promise(r => setTimeout(r, 8));
    }
    setProgress({ value: 72, label: 'Compressing with DEFLATE…' });
    const outBlob = await zip.generateAsync(
      { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
      meta => setProgress({ value: 72 + Math.round(meta.percent * 0.26), label: `Deflating… ${Math.round(meta.percent)}%` })
    );
    setProgress({ value: 100, label: 'Done!' });
    const origSize = files.reduce((a, f) => a + f.size, 0);
    const pct = savingsPct(origSize, outBlob.size);
    setBlob(outBlob);
    setResult({ origSize, compSize: outBlob.size, pct, count: files.length });
    setBusy(false);
  }

  function reset() { setFiles([]); setResult(null); setBlob(null); setBusy(false); }

  const totalSize = files.reduce((a, f) => a + f.size, 0);

  return (
    <div>
      <DropZone
        icon="📦" title="Drop any files here" sub="Pack multiple files into a single downloadable ZIP"
        formats={['any format', 'multiple files']}
        accept="*" multiple
        onFile={addFiles} accentColor="#f53b6e"
      />

      {files.length > 0 && (
        <div style={{ marginTop: 16, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {files.length} file{files.length > 1 ? 's' : ''} · {fmtSize(totalSize)}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="ghost" onClick={() => extraRef.current?.click()} style={{ padding: '6px 12px', fontSize: 11 }}>+ Add more</Btn>
              <input ref={extraRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
            </div>
          </div>

          {/* File list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 220, overflowY: 'auto', marginBottom: 14 }}>
            {files.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 'var(--radius-xs)',
                background: 'var(--bg2)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{fileEmoji(f.name)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{fmtSize(f.size)}</div>
                </div>
                <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 15, padding: '2px 6px', borderRadius: 4 }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn onClick={createZip} disabled={busy} style={{ background: busy ? '#c0315a' : '#f53b6e', color: '#fff' }}>
              {busy ? <><Spinner color="#fff" />&nbsp;Packing…</> : '📦 Create ZIP'}
            </Btn>
            <Btn variant="ghost" onClick={reset} style={{ padding: '12px 16px', fontSize: 12 }}>Clear all</Btn>
          </div>

          {busy && <ProgressBar value={progress.value} label={progress.label} accent="#f53b6e" />}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>ZIP created ✓</span>
            <Badge pct={result.pct} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 4 }}>
            <Stat value={result.count} label="Files packed" />
            <Stat value={fmtSize(result.compSize)} label="ZIP size" accent="#f53b6e" />
            <Stat value={`${result.pct}%`} label="Smaller" accent="#c8f53b" />
          </div>
          <SizeBar origSize={result.origSize} compSize={result.compSize} accent="#f53b6e" />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Btn onClick={() => triggerDownload(blob, 'compressed_files.zip')} style={{ background: '#f53b6e', color: '#fff' }}>
              ⬇ Download ZIP
            </Btn>
          </div>
          <StatusBanner type="info">
            DEFLATE compression (LZ77 + Huffman) — compatible with all ZIP tools.<br />
            Already-compressed files (JPEG, MP4, ZIP) won't shrink much — they've already removed redundancy.
          </StatusBanner>
        </div>
      )}
    </div>
  );
}
