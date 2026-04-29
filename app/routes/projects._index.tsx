import { useLoaderData } from '@remix-run/react';
import Dashboard from '~/components/dashboard/Dashboard';
import { deleteProject, duplicateProject, updateProject, getAllProjects } from '~/lib/persistence/projects';
import type { Project } from '~/lib/persistence/projects';

export const loader = async () => {
  const projects = await getAllProjects();
  return { projects };
};

export default function Projects() {
  const { projects } = useLoaderData<{ projects: Project[] }>();

  const handleOpenProject = (id: string) => {
    console.log('Opening project:', id);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    window.location.reload();
  };

  const handleDuplicateProject = async (id: string) => {
    await duplicateProject(id);
    window.location.reload();
  };

  const handleShareProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      const shareUrl = `${window.location.origin}/projects/${id}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Project URL copied to clipboard: ' + shareUrl);
    }
  };

  const handleEditProject = async (id: string) => {
    const newName = prompt('Enter new project name:');
    if (newName && newName.trim()) {
      await updateProject(id, { name: newName });
      window.location.reload();
    }
  };

  return (
    <div className="flex h-full">
      <Dashboard
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        onShareProject={handleShareProject}
        onEditProject={handleEditProject}
      />
    </div>
  );
}
