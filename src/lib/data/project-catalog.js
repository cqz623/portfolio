import files from 'virtual:project-gallery-files';
import { projects as existing } from './projects.js';
import folders from 'virtual:project-folders';
import { retainedProjects } from '../utils/retained-projects.js';

export const projects = retainedProjects(existing, files, folders);
