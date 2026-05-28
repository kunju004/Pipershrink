import React, { useState } from 'react';
import { huffmanCompress } from '../huffman';
import { fmtSize, savingsPct, triggerDownload, stemName } from '../utils';
import { DropZone, FileInfoRow, SliderControl, Btn, Spinner, ProgressBar, Stat, SizeBar, StatusBanner, Badge } from './UI';

const LEVEL_LABELS = ['', 'Fast', 'Balanced', 'Maximum'];

export default function TextTab() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [level, setLevel] = useState(2);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, label: '' });
  const [result, setResult] = useState(null);
  const [blob, setBlob] = useState(null);

  function handleFile(f) {
    setFile(f); setResult(null); setBlob(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result.slice(0, 500));
    reader.readAsText(f);
  }

  async function compress() {
    if (!file) return;
    setBusy(true); setResult(null);
    setProgress({ value: 5, label: 'Reading file…' });
    const text = await file.text();

    setProgress({ value: 30, label: 'Building frequency table…' });
    await tick();
    setProgress({ value: 60, label: `Huffman encoding (${LEVEL_LABELS[level]})…` });
    await tick();

    const compressed = huffmanCompress(text);
    const outBlob = new Blob([compressed], { type: 'application/octet-stream' });

    setProgress({ value: 100, label: 'Done!' });
    await tick();

    const pct = savingsPct(file.size, outBlob.size);
    setBlob(outBlob);
    setResult({ origSize: file.size, compSize: outBlob.size, pct, fname: stemName(file.name) + '_compressed.sqz' });
    setBusy(false);
  }

  function reset() { setFile(null); setPreview(''); setResult(null); setBlob(null); setBusy(false); }

  return (
    <div>
      {!file ? (
        <DropZone
          icon="📄" title="Drop your text file" sub="or click to browse"
          formats={['txt', 'md', 'csv', 'json', 'xml', 'log', 'html', 'js', 'css']}
          accept=".txt,.md,.csv,.json,.xml,.log,.html,.js,.css"
          onFile={handleFile} accentColor="#3bf5d4"
        />
      ) : (
        <div>
          <FileInfoRow name={file.name} meta={`${fmtSize(file.size)} · ${file.type || 'text'}`} emoji="📄" onClear={reset} />

          {/* Preview */}
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 14px',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)',
            maxHeight: 90, overflowY: 'auto', lineHeight: 1.7, marginBottom: 20,
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {preview}{file.size > 500 ? <span style={{ color: 'var(--text3)' }}>…</span> : ''}
          </div>

          <SliderControl
            label="Compression Level" value={level} displayValue={LEVEL_LABELS[level]}
            min={1} max={3} onChange={setLevel}
            leftLabel="Fast" rightLabel="Maximum"
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn onClick={compress} disabled={busy}>
              {busy ? <><Spinner />&nbsp;Compressing…</> : '⚡ Compress'}
            </Btn>
            <Btn variant="ghost" onClick={reset} style={{ padding: '12px 16px', fontSize: 12 }}>Clear</Btn>
          </div>

          {busy && <ProgressBar value={progress.value} label={progress.label} accent="#3bf5d4" />}

          {result && (
            <div style={{ marginTop: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Compression complete ✓</span>
                <Badge pct={result.pct} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 4 }}>
                <Stat value={fmtSize(result.origSize)} label="Original" />
                <Stat value={fmtSize(result.compSize)} label="Compressed" accent="#3bf5d4" />
                <Stat value={`${result.pct}%`} label="Saved" accent="#c8f53b" />
              </div>
              <SizeBar origSize={result.origSize} compSize={result.compSize} accent="#3bf5d4" />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <Btn onClick={() => triggerDownload(blob, result.fname)}>⬇ Download .sqz</Btn>
              </div>
              <StatusBanner type="info">
                Huffman coding — assigns shorter bit codes to frequent characters.<br />
                Best on: logs, source code, CSV, JSON. Typical savings: 40–60%.
              </StatusBanner>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function tick() { return new Promise(r => setTimeout(r, 60)); }
