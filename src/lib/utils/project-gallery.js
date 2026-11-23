import { publicMediaPath } from '../data/media-delivery.js';
/** @typedef {{src: string, alt: string, caption?: string, width?: number, height?: number}} GalleryImage */
/** @typedef {{title: string, imageDirectory: string, cover?: GalleryImage | null, images: GalleryImage[], galleryImages?: GalleryImage[]}} ImageProject */

/** Exact stem rules, with case-insensitive supported extensions and numeric sorting. @param {string} directory @param {string[]} files */
export function classifyProjectImages(directory, files) {
  const local = files.filter(src => src.startsWith(directory) && !src.slice(directory.length).includes('/')).sort();
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  /** @type {string[]} */
  const unrecognized = [];
  for (const src of local) {
    const stem = src.slice(directory.length).match(/^(cover(?:\d+)?|\d+)\.(?:jpe?g|png|webp|mp4|pdf)$/i)?.[1].toLowerCase();
    let key;
    if (stem === 'cover') key = 'cover';
    else if (stem?.startsWith('cover') && Number(stem.slice(5)) > 0) key = `large:${Number(stem.slice(5))}`;
    else if (stem && /^\d+$/.test(stem) && Number(stem) > 0) key = `gallery:${Number(stem)}`;
    if (!key) { unrecognized.push(src); continue; }
    groups.set(key, [...(groups.get(key) ?? []), src]);
  }
  const conflicts = [...groups].filter(([, paths]) => paths.length > 1).map(([slot, paths]) => ({ slot, paths }));
  const coverCandidates = groups.get('cover') ?? [];
  /** @param {string} prefix */
  const sort = (prefix) => [...groups].filter(([key]) => key.startsWith(prefix)).sort(([a], [b]) => Number(a.split(':')[1]) - Number(b.split(':')[1])).map(([, paths]) => paths);
  return { hasImages: local.length > 0, coverCandidates, largeCandidates: sort('large:'), galleryCandidates: sort('gallery:'), conflicts, unrecognized };
}

/**
 * For a duplicated slot, keep its previously configured source if possible;
 * otherwise use a deterministic filename order and surface the conflict in audits.
 * @param {ImageProject} project @param {string[]} files
 * @param {Record<string, {width: number, height: number} | undefined>} [dimensions]
 */
export function projectImageLayout(project, files, dimensions = {}) {
  const classified = classifyProjectImages(project.imageDirectory, files);
  const previous = [project.cover, ...project.images, ...(project.galleryImages ?? [])].filter(image => image !== undefined);
  /** @param {string[]} candidates @param {string} label @returns {GalleryImage | undefined} */
  function select(candidates, label) {
    // PDFs are a fallback: preserve the established raster/video selection first.
    const preferred = candidates.filter(src => !/\.pdf$/i.test(src));
    candidates = preferred.length ? preferred : candidates;
    const old = label === 'cover' && candidates.find(src => src.toLowerCase().endsWith('.mp4'))
      ? { src: candidates.find(src => src.toLowerCase().endsWith('.mp4')) }
      : previous.find(image => image && candidates.includes(image.src));
    const src = old?.src ?? candidates[0];
    if (!src) return undefined;
    const sameSlot = previous.find(image => image && candidates.includes(image.src));
    return { ...sameSlot, src: publicMediaPath(src), alt: sameSlot?.alt ?? `${project.title} — ${label}`, ...dimensions[src] };
  }
  // Homepage cover is deliberately separate from both detail-page image groups.
  const cover = select(classified.coverCandidates, 'cover');
  const large = classified.largeCandidates.map((paths, i) => select(paths, `large view ${i + 1}`)).filter(image => image !== undefined);
  const gallery = classified.galleryCandidates.map(paths => select(paths, `view ${Number(paths[0].split('/').at(-1)?.match(/^\d+/)?.[0])}`)).filter(image => image !== undefined);
  return { ...classified, cover, large, gallery };
}

/** @param {ImageProject} project @param {string[]} files */
export function projectGallery(project, files) {
  return projectImageLayout(project, files).gallery;
}

/** Only an actual `cover` may supply a homepage thumbnail. @param {ImageProject} project @param {string[]} files @param {Record<string, {width: number, height: number} | undefined>} [dimensions] */
export function projectWithDiscoveredCover(project, files, dimensions = {}) {
  const layout = projectImageLayout(project, files, dimensions);
  return layout.hasImages || project.cover ? { ...project, cover: layout.cover ?? null } : project;
}
