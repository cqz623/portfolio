/** Separate delivery copies; original source media remains untouched and local. */
export const mediaReplacements = {
  '/images/projects/floating-purifier/cover1.png': '/optimized/projects/floating-purifier/cover1.webp',
  '/images/projects/material- experimentation/cover01.mp4': '/optimized/projects/material- experimentation/cover01.mp4'
};

/** @param {string} src */
export function publicMediaPath(src) {
  return /** @type {Record<string, string>} */ (mediaReplacements)[src] ?? src;
}
