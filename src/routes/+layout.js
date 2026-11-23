import { dev } from '$app/env';

export const prerender = true;
// GitHub Pages serves directory indexes for direct visits to nested URLs.
export const trailingSlash = dev ? 'never' : 'always';
