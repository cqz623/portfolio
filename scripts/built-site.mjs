import { manifest } from '../.svelte-kit/output/server/manifest-full.js';

export { manifest };
const inferred = manifest.app_path === manifest.app_dir ? '' : `/${manifest.app_path.slice(0, -(manifest.app_dir.length + 1))}`;
export const base = process.env.PORTFOLIO_BASE_PATH ?? inferred;
export const pagePath = path => path.endsWith('/') || /\.[^/]+$/.test(path) ? path : `${path}/`;
