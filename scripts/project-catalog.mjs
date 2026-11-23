import { readdirSync } from 'node:fs';
import { projects as existing } from '../src/lib/data/projects.js';
import { retainedProjects } from '../src/lib/utils/retained-projects.js';
import { projectGalleryFiles } from './project-gallery-files.mjs';

const catalog = projectGalleryFiles().load('\0virtual:project-gallery-files').match(/^export default (.*); export const dimensions = (.*);$/);
export const files = JSON.parse(catalog[1]);
export const dimensions = JSON.parse(catalog[2]);
export const folders = readdirSync('static/images/projects', { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
export const projects = retainedProjects(existing, files, folders);
