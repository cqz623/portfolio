import { discoverProjects } from './discovered-projects.js';

const allowed = new Set([
  'population-flood-sandbox', 'spatial-barrier-game', 'cloud', 'deep-eye',
  'downsville-covered-bridge', 'floating-purifier', 'layered-walkway',
  'light-and-shadow-lane', 'mercury-store', 'reviving-spaces', 'sustainability',
  'theatre', 'material-experimentation', 'decarbonization', 'theory-in-practice', 'xu-tiantian', 'funeral-home', 'aptne-presentation', 'aptne'
]);
// Match the actual folder paths, retaining existing whitespace aliases unchanged.
const folderKey = (/** @type {string} */ folder) => folder.replace(/\s+/g, '').toLowerCase();

/** Keep permitted folder-backed projects and explicit registrations awaiting media.
 * @param {import('../data/projects.js').Project[]} existing
 * @param {string[]} files
 * @param {string[]} folders
 */
export function retainedProjects(existing, files, folders) {
  const directories = new Set(folders.filter(folder => allowed.has(folderKey(folder))).map(folder => `/images/projects/${folder}/`));
  return discoverProjects(existing, files).filter(project => directories.has(project.imageDirectory) || (
    project.allowWithoutMedia === true && allowed.has(folderKey(project.imageDirectory.match(/^\/images\/projects\/([^/]+)\/$/)?.[1] ?? ''))
  ));
}
