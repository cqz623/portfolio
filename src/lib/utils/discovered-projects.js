import { discoveredProjectDetails } from '../data/projects.js';

/** Append media-backed folders without changing existing metadata, aliases or order.
 * @param {import('../data/projects.js').Project[]} existing
 * @param {string[]} files
 */
export function discoverProjects(existing, files) {
  const result = [...existing];
  const folders = [...new Set(files.map(src => src.match(/^\/images\/projects\/([^/]+)\/[^/]+$/)?.[1]).filter(Boolean))].sort();
  for (const folder of folders) {
    if (!folder) continue;
    const imageDirectory = `/images/projects/${folder}/`;
    const slug = folder.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
    if (result.some(project => project.imageDirectory === imageDirectory || project.slug === slug)) continue;
    // A recognized naming slot is required; unrelated files do not create projects.
    if (!files.some(src => src.startsWith(imageDirectory) && /^(?:cover(?:0*[1-9]\d*)?|0*[1-9]\d*)\.(?:jpe?g|png|webp|mp4|pdf)$/i.test(src.slice(imageDirectory.length)))) continue;
    result.push({ slug, title: discoveredProjectDetails[slug]?.title ?? folder.trim(), imageDirectory, year: null, category: '', description: discoveredProjectDetails[slug]?.description ?? null, cover: null, images: [], source: null });
  }
  return result;
}
