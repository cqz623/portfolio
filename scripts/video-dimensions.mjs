import { openSync, closeSync, fstatSync, readSync } from 'node:fs';

/** Read MP4 track dimensions by seeking through atom headers, never loading mdat. */
export function videoDimensions(path) {
  const fd = openSync(path, 'r');
  const read = (offset, length) => {
    const bytes = Buffer.alloc(length);
    return readSync(fd, bytes, 0, length, offset) === length ? bytes : null;
  };
  function scan(start, end) {
    let offset = start;
    while (offset + 8 <= end) {
      const header = read(offset, 8);
      if (!header) return;
      let size = header.readUInt32BE(0), headerSize = 8;
      const type = header.toString('ascii', 4, 8);
      if (size === 1) {
        const extended = read(offset + 8, 8);
        if (!extended) return;
        size = Number(extended.readBigUInt64BE()); headerSize = 16;
      } else if (!size) size = end - offset;
      if (!Number.isSafeInteger(size) || size < headerSize || offset + size > end) return;
      if (type === 'moov' || type === 'trak') {
        const result = scan(offset + headerSize, offset + size);
        if (result) return result;
      } else if (type === 'tkhd' && size - headerSize >= 84 && size < 1024) {
        const track = read(offset + headerSize, size - headerSize);
        const width = track.readUInt32BE(track.length - 8) / 65536;
        const height = track.readUInt32BE(track.length - 4) / 65536;
        const matrix = track.length - 44;
        const rotated = track.readInt32BE(matrix) === 0 && Math.abs(track.readInt32BE(matrix + 4)) === 65536;
        if (width > 0 && height > 0) return rotated ? { width: height, height: width } : { width, height };
      }
      offset += size;
    }
  }
  try { return scan(0, fstatSync(fd).size); } finally { closeSync(fd); }
}
