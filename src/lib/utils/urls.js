import { asset, resolve } from '$app/paths';

/** Resolve data-driven local static paths without losing the configured base. @param {string} path */
export function staticUrl(path) {
  return asset(/** @type {import('$app/types').AssetPath} */ (path.replace(/^\/+/, '')));
}

/** @param {string} slug */
export function projectUrl(slug) {
  return resolve('/projects/[slug]', { slug });
}
