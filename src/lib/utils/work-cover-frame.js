const frames = [
  { ratio: '3 / 2', value: 3 / 2 },
  { ratio: '5 / 4', value: 5 / 4 },
  { ratio: '1 / 1', value: 1 },
  { ratio: '3 / 4', value: 3 / 4 },
  { ratio: '2 / 3', value: 2 / 3 }
];

/**
 * Work covers only: minimize proportional mismatch (and object-fit cover cropping).
 * Build-time intrinsic dimensions reserve the frame before media loads. The narrowest
 * available ratio bounds tall sources to 1.5 times the current column width.
 * @param {{width?: number, height?: number} | null | undefined} cover
 * @param {{ratio?: string, position?: string} | undefined} [thumbnail]
 */
export function workCoverFrame(cover, thumbnail) {
  const width = cover?.width;
  const height = cover?.height;
  const position = thumbnail?.position ?? '50% 50%';
  if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { ratio: frames.find(frame => frame.ratio === thumbnail?.ratio)?.ratio ?? '5 / 4', position };
  }
  // Subtracting logarithms avoids overflow for unusually large/small dimensions.
  const sourceLog = Math.log(width) - Math.log(height);
  const closest = frames.reduce((best, frame) =>
    Math.abs(sourceLog - Math.log(frame.value)) < Math.abs(sourceLog - Math.log(best.value)) ? frame : best
  );
  return { ratio: closest.ratio, position };
}
