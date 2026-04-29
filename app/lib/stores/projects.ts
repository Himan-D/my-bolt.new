import { atom } from 'nanostores';
import type { Project } from '~/lib/persistence/projects';

export const projectsStore = atom<Project[]>([]);
export const currentProjectStore = atom<Project | null>(null);
export const projectModalOpenStore = atom<boolean>(false);
