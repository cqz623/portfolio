import type { Project } from '../data/projects.js';
import type { GalleryImage } from '../utils/project-gallery.js';
export type CoverProject = Omit<Project, 'cover'> & {
  cover?: GalleryImage | null;
  frame: { ratio: string; position: string };
};
