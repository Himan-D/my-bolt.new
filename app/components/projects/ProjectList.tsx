import { useStore } from '@nanostores/react';
import { ProjectCard } from './ProjectCard';
import { projectsStore } from '~/lib/stores/projects';
import type { Project } from '~/lib/persistence/projects';

interface ProjectListProps {
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onShareProject: (id: string) => void;
  onEditProject: (id: string) => void;
}

export function ProjectList({
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onShareProject,
  onEditProject,
}: ProjectListProps) {
  const projects = useStore(projectsStore);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await onDeleteProject(id);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
        <p className="text-zinc-500 mb-6">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project: Project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpenProject}
          onDelete={handleDelete}
          onDuplicate={onDuplicateProject}
          onShare={onShareProject}
          onEdit={onEditProject}
        />
      ))}
    </div>
  );
}
