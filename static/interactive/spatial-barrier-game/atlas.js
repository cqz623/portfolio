/** Presentation-only palettes. Field values and graph calculations stay in core.js. */
export const palettes = {
  manhattan: ['#FAF9DF','#F5F2AD','#F0EC75','#E9E63A','#D8D329','#B6AD19','#817B12'],
  bfs: ['#F0EFFB','#DAD6F5','#B9B0EB','#9387DB','#7064C8','#5044A7','#30256F'],
  detour: ['#F9F1E8','#F9D8B5','#F8B56F','#F28A35','#E86B24','#C64C23','#842D24'],
};
export function paletteColor(kind, ratio) {
  const stops = palettes[kind === 'comparison' ? 'detour' : kind];
  const position = Math.max(0, Math.min(1, ratio)) * (stops.length - 1);
  const low = Math.floor(position), high = Math.min(low + 1, stops.length - 1);
  const weight = position - low;
  const rgb = color => [1,3,5].map(offset => parseInt(color.slice(offset, offset + 2), 16));
  return `rgb(${rgb(stops[low]).map((value, index) => Math.round(value + (rgb(stops[high])[index] - value) * weight)).join(', ')})`;
}
export const paletteGradient = kind => `linear-gradient(90deg, ${palettes[kind === 'comparison' ? 'detour' : kind].join(', ')})`;
