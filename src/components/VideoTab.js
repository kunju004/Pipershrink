import React, { useState, useRef } from 'react';
import { fmtSize, fmtDuration, savingsPct, triggerDownload, stemName } from '../utils';
import { DropZone, FileInfoRow, SliderControl, Btn, Spinner, ProgressBar, Stat, SizeBar, StatusBanner, Badge, Toggle } from './UI';

const QUALITIES = [
  { label: 'Low — 480p', scale: 'scale=-2:480', crf: 32, desc: 'smallest file' },
  { label: 'Medium — 720p', scale: 'scale=-2:720', crf: 28, desc: 'recommended' },
  { label: 'High — 1080p', scale: 'scale=-2:1080', crf: 23, desc: 'best quality' },
  { label: 'Original resolution', scale: '', crf: 20, desc: 'no resize' },
];
const PRESETS = ['slow', 'medium', 'fast'];
const PRESET_LABELS = ['Smaller file', 'Balanced', 'Faster encoding'];

let ffmpegCache = null;

export default function VideoTab() {
  const [file, setFile] = useState(null);
  const [vidMeta, setVidMeta] = useState(null);
  const [qualityIdx, setQualityIdx] = useState(1);
  const [presetIdx, setPresetIdx] = useState(1);
  const [muteAudio, setMuteAudio] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, label: '' });
  const [ffLog, setFfLog] = useState('');
  const [result, setResult] = useState(null);
  const [blob, setBlob] = useState(null);
  const [compUrl, setCompUrl] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef();

  function handleFile(f) {
    setFile(f); setResult(null); setBlob(null); setCompUrl(null); setError('');
    const url = URL.createObjectURL(f);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.onloadedmetadata = () => {
        setVidMeta({
          duration: videoRef.current.duration,
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });
      };
    }
  }

  async function compress() {
    if (!file) return;
    setBusy(true); setResult(null); setError('');
    const q = QUALITIES[+qualityIdx];
    const preset = PRESETS[+presetIdx];

    try {
      setProgress({ value: 2, label: 'Loading FFmpeg WebAssembly…' });
      setFfLog('Fetching FFmpeg core (~30 MB, cached after first load)…');

      // Lazy-load FFmpeg from CDN
      if (!ffmpegCache) {
        const { FFmpeg } = await import(/* webpackIgnore: true */ 'https://esm.sh/@ffmpeg/ffmpeg@0.12.6');
        const { toBlobURL } = await import(/* webpackIgnore: true */ 'https://esm.sh/@ffmpeg/util@0.12.1');
        const ff = new FFmpeg();
        ff.on('log', ({ message }) => setFfLog(message.slice(0, 140)));
        ff.on('progress', ({ progress: p }) => {
          const pct = Math.min(94, Math.round(p * 100));
          setProgress({ value: 10 + pct * 0.85, label: `Encoding… ${pct}%` });
        });
        const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ff.load({
          coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegCache = { ff, toBlobURL, fetchFile: (await import(/* webpackIgnore: true */ 'https://esm.sh/@ffmpeg/util@0.12.1')).fetchFile };
      }

      const { ff, fetchFile } = ffmpegCache;
      setProgress({ value: 8, label: 'Writing to virtual filesystem…' });
      const ext = file.name.split('.').pop();
      const inName = `input.${ext}`;
      await ff.writeFile(inName, await fetchFile(file));

      setProgress({ value: 10, label: 'Starting FFmpeg…' });

      // Build args — mirrors the two-pass logic in video.py (simplified to CRF for browser)
      const args = ['-i', inName];
      if (q.scale) args.push('-vf', q.scale);
      args.push(
        '-c:v', 'libx264',
        '-crf', String(q.crf),
        '-preset', preset,
        '-movflags', '+faststart',
      );
      if (muteAudio) {
        args.push('-an');
      } else {
        args.push('-c:a', 'aac', '-b:a', '128k');
      }
      args.push('output.mp4');

      await ff.exec(args);

      setProgress({ value: 96, label: 'Reading output…' });
      const data = await ff.readFile('output.mp4');
      const outBlob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup virtual FS
      try { await ff.deleteFile(inName); await ff.deleteFile('output.mp4'); } catch (_) {}

      setProgress({ value: 100, label: 'Done!' });
      const cUrl = URL.createObjectURL(outBlob);
      setBlob(outBlob);
      setCompUrl(cUrl);
      const pct = savingsPct(file.size, outBlob.size);
      setResult({
        origSize: file.size, compSize: outBlob.size, pct,
        codec: 'libx264', crf: q.crf, preset, muteAudio,
        fname: stemName(file.name) + '_compressed.mp4',
      });
      setFfLog('');
    } catch (err) {
      setError(err.message || 'Compression failed. Try a smaller file or different format.');
      console.error(err);
    }
    setBusy(false);
  }

  function reset() { setFile(null); setVidMeta(null); setResult(null); setBlob(null); setCompUrl(null); setError(''); setBusy(false); setFfLog(''); }

  return (
    <div>
      {!file ? (
        <DropZone
          icon="🎬" title="Drop your video" sub="Processed with real FFmpeg — entirely in your browser"
          formats={['mp4', 'webm', 'mov', 'ogg']}
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onFile={handleFile} accentColor="#a855f7"
        />
      ) : (
        <div>
          <FileInfoRow name={file.name} meta={`${fmtSize(file.size)} · ${file.type}`} emoji="🎬" onClear={reset} />

          {/* Video preview */}
          <video
            ref={videoRef} controls muted playsInline
            style={{ width: '100%', borderRadius: 'var(--radius-sm)', background: '#000', maxHeight: 200, display: 'block', marginBottom: 16 }}
          />

          {/* Meta grid */}
          {vidMeta && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Duration', val: fmtDuration(vidMeta.duration) },
                { label: 'Resolution', val: `${vidMeta.width}×${vidMeta.height}` },
                { label: 'Size', val: fmtSize(file.size) },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          <SliderControl
            label="Output Quality" value={qualityIdx} displayValue={QUALITIES[+qualityIdx].label}
            min={0} max={3} onChange={setQualityIdx} leftLabel="480p" rightLabel="Original"
          />
          <SliderControl
            label="Encoding Speed" value={presetIdx} displayValue={PRESET_LABELS[+presetIdx]}
            min={0} max={2} onChange={setPresetIdx} leftLabel="Smaller file" rightLabel="Faster"
          />
          <Toggle label="Remove Audio Track" sub="Strips audio — saves extra space on silent clips" checked={muteAudio} onChange={setMuteAudio} />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Btn onClick={compress} disabled={busy} style={{ background: busy ? '#8b38c4' : '#a855f7', color: '#fff' }}>
              {busy ? <><Spinner color="#fff" />&nbsp;Processing…</> : '🎬 Compress Video'}
            </Btn>
            <Btn variant="ghost" onClick={reset} style={{ padding: '12px 16px', fontSize: 12 }}>Clear</Btn>
          </div>

          {busy && <ProgressBar value={progress.value} label={progress.label} accent="#a855f7" />}
          {ffLog && (
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ffLog}
            </div>
          )}

          {error && <StatusBanner type="error">⚠️ {error}</StatusBanner>}

          {result && (
            <div style={{ marginTop: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Video compressed ✓</span>
                <Badge pct={result.pct} />
              </div>

              <video src={compUrl} controls playsInline style={{ width: '100%', borderRadius: 'var(--radius-xs)', background: '#000', maxHeight: 180, display: 'block', marginBottom: 16 }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 4 }}>
                <Stat value={fmtSize(result.origSize)} label="Original" />
                <Stat value={fmtSize(result.compSize)} label="Compressed" accent="#a855f7" />
                <Stat value={`${result.pct}%`} label="Smaller" accent="#c8f53b" />
              </div>
              <SizeBar origSize={result.origSize} compSize={result.compSize} accent="#a855f7" />

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <Btn onClick={() => triggerDownload(blob, result.fname)} style={{ background: '#a855f7', color: '#fff' }}>
                  ⬇ Download MP4
                </Btn>
              </div>
              <StatusBanner type="info">
                libx264 · CRF {result.crf} · {result.preset} preset · {result.muteAudio ? 'audio removed' : 'AAC 128k'}<br />
                FFmpeg ran entirely in your browser via WebAssembly — no file ever left your device.
              </StatusBanner>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
