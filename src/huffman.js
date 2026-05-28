// Huffman Coding — JS port of Huffman_Compression_Decompression.py
// Implements the exact same algorithm: min-heap merge, code table, binary packing

class HeapNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function makeFrequencyDict(text) {
  const freq = {};
  for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
  return freq;
}

function buildHeap(freq) {
  return Object.entries(freq).map(([ch, f]) => new HeapNode(ch, f));
}

function mergeNodes(heap) {
  while (heap.length > 1) {
    heap.sort((a, b) => a.freq - b.freq);
    const n1 = heap.shift();
    const n2 = heap.shift();
    const merged = new HeapNode(null, n1.freq + n2.freq);
    merged.left = n1;
    merged.right = n2;
    heap.push(merged);
  }
  return heap[0];
}

function makeCodes(root) {
  const codes = {};
  const revMapping = {};
  function walk(node, code) {
    if (!node) return;
    if (node.char !== null) {
      codes[node.char] = code || '0';
      revMapping[code || '0'] = node.char;
      return;
    }
    walk(node.left, code + '0');
    walk(node.right, code + '1');
  }
  walk(root, '');
  return { codes, revMapping };
}

function getEncodedText(text, codes) {
  let encoded = '';
  for (const ch of text) encoded += codes[ch];
  return encoded;
}

function padEncodedText(encoded) {
  const extra = 8 - (encoded.length % 8);
  const padded = encoded + '0'.repeat(extra === 8 ? 0 : extra);
  const padInfo = (extra === 8 ? 0 : extra).toString(2).padStart(8, '0');
  return padInfo + padded;
}

function getByteArray(padded) {
  const bytes = new Uint8Array(padded.length / 8);
  for (let i = 0; i < padded.length; i += 8) {
    bytes[i / 8] = parseInt(padded.slice(i, i + 8), 2);
  }
  return bytes;
}

export function huffmanCompress(text) {
  const freq = makeFrequencyDict(text);
  const heap = buildHeap(freq);
  const root = mergeNodes(heap);
  const { codes, revMapping } = makeCodes(root);
  const encoded = getEncodedText(text, codes);
  const padded = padEncodedText(encoded);
  const compressed = getByteArray(padded);

  // Bundle: [4-byte header length][JSON header][compressed bytes]
  // JSON header contains revMapping and original length for decompression
  const header = JSON.stringify({ revMapping, originalLen: text.length });
  const headerBytes = new TextEncoder().encode(header);
  const headerLen = headerBytes.length;

  const output = new Uint8Array(4 + headerLen + compressed.length);
  new DataView(output.buffer).setUint32(0, headerLen, false);
  output.set(headerBytes, 4);
  output.set(compressed, 4 + headerLen);

  return output;
}

export function huffmanDecompress(bytes) {
  const view = new DataView(bytes.buffer || bytes);
  const headerLen = view.getUint32(0, false);
  const headerBytes = bytes.slice(4, 4 + headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes));
  const { revMapping, originalLen } = header;
  const compressedBytes = bytes.slice(4 + headerLen);

  // Rebuild bit string
  let bitString = '';
  for (const byte of compressedBytes) bitString += byte.toString(2).padStart(8, '0');

  // Remove padding (first 8 bits = padding count)
  const extraPadding = parseInt(bitString.slice(0, 8), 2);
  const encoded = bitString.slice(8, extraPadding ? -extraPadding : undefined);

  // Decode
  let current = '';
  let decoded = '';
  for (const bit of encoded) {
    current += bit;
    if (revMapping[current] !== undefined) {
      decoded += revMapping[current];
      current = '';
      if (decoded.length >= originalLen) break;
    }
  }
  return decoded;
}
