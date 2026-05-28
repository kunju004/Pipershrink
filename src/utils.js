export function fmtSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

export function fmtDuration(secs) {
  if (!secs || isNaN(secs)) return '—';
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function savingsPct(orig, comp) {
  if (!orig || orig === 0) return 0;
  return Math.max(0, Math.round((1 - comp / orig) * 100));
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}

export function stemName(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

export function fileEmoji(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map = {
    jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', webp: '🖼', bmp: '🖼',
    mp4: '🎬', mov: '🎬', webm: '🎬', avi: '🎬', mkv: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵',
    pdf: '📕', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    txt: '📄', md: '📄', csv: '📊', json: '⚙', js: '⚙', ts: '⚙',
    html: '🌐', css: '🎨', zip: '📦', tar: '📦', gz: '📦',
  };
  return map[ext] || '📁';
}

export function badgeStyle(pct) {
  if (pct >= 40) return { bg: 'rgba(200,245,59,0.12)', color: '#c8f53b', border: 'rgba(200,245,59,0.3)' };
  if (pct >= 15) return { bg: 'rgba(59,245,212,0.1)', color: '#3bf5d4', border: 'rgba(59,245,212,0.3)' };
  return { bg: 'rgba(245,59,110,0.1)', color: '#f53b6e', border: 'rgba(245,59,110,0.3)' };
}
