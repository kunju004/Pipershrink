# ⚡ Squeeze — File Compressor

A modern, mobile-first web app that compresses **text, images, video, and ZIP archives** entirely in the browser.  
**No server. No uploads. Files never leave your device.**

---

## What This Is

Squeeze is a full web rebuild of a Python/Tkinter desktop application that used:
- `Huffman_Compression_Decompression.py` — Huffman coding for text
- `JPEG.py` — DCT-based image compression
- `video.py` — FFmpeg subprocess for video
- `tkinter` — desktop GUI

Every algorithm has been faithfully ported or delegated to browser-native equivalents.

---

## Features

| Tab | Algorithm | Original Python |
|-----|-----------|-----------------|
| 📄 Text | Huffman coding (JS port) | `Huffman_Compression_Decompression.py` |
| 🖼 Image | Canvas API JPEG re-encoding | `JPEG.py` (DCT) |
| 🎬 Video | FFmpeg.wasm (libx264, H.264) | `video.py` (python-ffmpeg) |
| 📦 ZIP | JSZip DEFLATE | *(new)* |

---

## Project Structure

```
squeeze-app/
├── public/
│   └── index.html            # HTML shell, Google Fonts
├── src/
│   ├── index.js              # React entry point
│   ├── index.css             # Global CSS, design tokens
│   ├── App.js                # Layout, nav, tab routing
│   ├── huffman.js            # Huffman algorithm (JS port of Python original)
│   ├── utils.js              # Shared helpers (fmtSize, triggerDownload, etc.)
│   └── components/
│       ├── UI.js             # Reusable: DropZone, Btn, Slider, Toggle, Stat, Badge...
│       ├── TextTab.js        # Text compression UI + logic
│       ├── ImageTab.js       # Image compression UI + Canvas API
│       ├── VideoTab.js       # Video compression UI + FFmpeg.wasm
│       └── ZipTab.js         # ZIP packing UI + JSZip
├── vercel.json               # Vercel deploy config (COOP/COEP headers for WASM)
├── netlify.toml              # Netlify deploy config
└── package.json
```

---

## Quick Start (Local)

```bash
cd squeeze-app
npm install
npm start
# → http://localhost:3000
```

---

## Deploy in 2 Minutes

### Option A — Vercel (recommended)
```bash
npm install -g vercel
cd squeeze-app
vercel
```
Or: push to GitHub → import at vercel.com → done. The `vercel.json` handles all config.

### Option B — Netlify
```bash
npm run build
# Drag the `build/` folder to netlify.com/drop
```
Or: connect GitHub repo, set build command `npm run build`, publish dir `build`.

> **Important:** The `vercel.json` / `netlify.toml` files set two HTTP headers required for FFmpeg.wasm to access `SharedArrayBuffer`:
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> Without these, video compression won't work.

### Option C — GitHub Pages
```bash
npm install -g gh-pages
# Add to package.json: "homepage": "https://yourusername.github.io/squeeze"
npm run build
npx gh-pages -d build
```
Note: GitHub Pages doesn't support custom headers, so video compression won't work. Use Vercel or Netlify for full functionality.

---

## How Each Algorithm Works

### 📄 Text — Huffman Coding (`huffman.js`)
Exact JS port of `Huffman_Compression_Decompression.py`:
1. Build a character frequency table
2. Insert all characters into a min-heap
3. Repeatedly merge the two lowest-frequency nodes into a parent
4. Walk the resulting tree to assign codes (left = 0, right = 1)
5. Common characters get short codes, rare ones get long codes
6. Pack bits into bytes; prepend a JSON header with the code table

**Output format:** `[4-byte header length][JSON header][compressed bytes]`

### 🖼 Image — Canvas API (`ImageTab.js`)
Delegates to the browser's native C++ JPEG encoder:
1. Decode image into raw pixels via `<img>`
2. Draw to `<canvas>` at target dimensions (GPU scaling)
3. Call `canvas.toBlob(cb, 'image/jpeg', quality)` — browser runs JPEG encoder internally using DCT, quantisation, and Huffman (same as `JPEG.py` but ~100x faster)

### 🎬 Video — FFmpeg.wasm (`VideoTab.js`)
Mirrors the libx264 codec used in `video.py`:
1. Lazy-load `@ffmpeg/ffmpeg` + `@ffmpeg/core` WASM (~30MB, cached)
2. Write file to FFmpeg's in-memory virtual filesystem
3. Execute: `-i input.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -preset medium -movflags +faststart output.mp4`
4. Read output bytes from virtual FS, wrap in Blob, trigger download

The original `video.py` used two-pass bitrate targeting (`-pass 1/2`). This version uses CRF (Constant Rate Factor) which gives equivalent quality with simpler setup.

### 📦 ZIP — JSZip DEFLATE (`ZipTab.js`)
DEFLATE = LZ77 (back-reference sliding window) + Huffman:
1. Scan file with ~32KB window, replace repeated strings with (distance, length) pointers
2. Huffman-code the result
3. Wrap in standard PKWARE ZIP format with central directory

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Fonts | Syne (display) + DM Mono |
| Text compression | Custom Huffman (JS) |
| Image compression | HTML5 Canvas API |
| Video compression | @ffmpeg/ffmpeg 0.12 (WASM) |
| ZIP | JSZip 3.10 |
| Deployment | Vercel / Netlify |
| Build | Create React App |

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Text | ✅ | ✅ | ✅ | ✅ |
| Image | ✅ | ✅ | ✅ | ✅ |
| Video (WASM) | ✅ | ✅ | ✅ 16.4+ | ✅ |
| ZIP | ✅ | ✅ | ✅ | ✅ |

Video compression requires SharedArrayBuffer support and the COOP/COEP headers on your host.
# Pipershrink
