import { resolve } from '$app/paths';
import { error, redirect } from '@sveltejs/kit';
import { projects } from '#lib/data/project-catalog.js';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  if (params.slug === 'cloud') redirect(308, resolve('/projects/[slug]', { slug: 'cloud-pavilion' }));
  const project = projects.find((project) => project.slug === params.slug);
  if (!project) error(404, 'Project not found');
  return { project };
}

/** Enumerate every project, including media-free registrations and the legacy alias.
 * @type {import('./$types').EntryGenerator}
 */
export function entries() {
  return [...projects.map(({ slug }) => ({ slug })), { slug: 'cloud' }];
}
