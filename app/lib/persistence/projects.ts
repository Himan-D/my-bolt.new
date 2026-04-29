import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('ProjectsDB');

export interface ProjectFile {
  content: string;
  language?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  files: Record<string, ProjectFile>;
  metadata?: Record<string, any>;
}

export interface ProjectDB {
  projects: Project[];
  currentProjectId: string | null;
}

const DB_NAME = 'hima_projects';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('projects')) {
        const objectStore = database.createObjectStore('projects', { keyPath: 'id' });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        logger.info('Created projects object store');
      }
    };
  });
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['projects'], 'readonly');
      const objectStore = transaction.objectStore('projects');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const projects = request.result as Project[];
        logger.info(`Retrieved ${projects.length} projects`);
        resolve(projects);
      };

      request.onerror = () => {
        logger.error('Failed to retrieve projects:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    logger.error('Error in getAllProjects:', error);
    return [];
  }
}

export async function saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['projects'], 'readwrite');
      const objectStore = transaction.objectStore('projects');

      const newProject: Project = {
        ...project,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const request = objectStore.add(newProject);

      request.onsuccess = () => {
        logger.info('Saved project:', newProject.name);
        resolve(newProject);
      };

      request.onerror = () => {
        logger.error('Failed to save project:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    logger.error('Error in saveProject:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['projects'], 'readwrite');
      const objectStore = transaction.objectStore('projects');

      const getRequest = objectStore.get(id);

      getRequest.onsuccess = () => {
        const existingProject = getRequest.result as Project;
        const updatedProject = {
          ...existingProject,
          ...updates,
          updatedAt: Date.now(),
        };

        const updateRequest = objectStore.put(updatedProject);

        updateRequest.onsuccess = () => {
          logger.info('Updated project:', id);
          resolve();
        };

        updateRequest.onerror = () => {
          logger.error('Failed to update project:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        logger.error('Failed to get project:', getRequest.error);
        reject(getRequest.error);
      };
    });
  } catch (error) {
    logger.error('Error in updateProject:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['projects'], 'readwrite');
      const objectStore = transaction.objectStore('projects');

      const request = objectStore.delete(id);

      request.onsuccess = () => {
        logger.info('Deleted project:', id);
        resolve();
      };

      request.onerror = () => {
        logger.error('Failed to delete project:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    logger.error('Error in deleteProject:', error);
    throw error;
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['projects'], 'readonly');
      const objectStore = transaction.objectStore('projects');

      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result as Project | null);
      };

      request.onerror = () => {
        logger.error('Failed to get project:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    logger.error('Error in getProject:', error);
    return null;
  }
}

export async function duplicateProject(id: string): Promise<Project> {
  try {
    const originalProject = await getProject(id);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const { id: _, createdAt: __, updatedAt: ___, ...projectData } = originalProject;
    return saveProject({
      ...projectData,
      name: `${projectData.name} (Copy)`,
    });
  } catch (error) {
    logger.error('Error in duplicateProject:', error);
    throw error;
  }
}
