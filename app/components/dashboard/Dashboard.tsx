import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { ProjectList } from '../projects/ProjectList';
import { workbenchStore } from '~/lib/stores/workbench';

interface DashboardProps {
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => Promise<void>;
  onDuplicateProject: (id: string) => Promise<void>;
  onShareProject: (id: string) => void;
  onEditProject: (id: string) => void;
}

export default function Dashboard({
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onShareProject,
  onEditProject,
}: DashboardProps) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const files = useStore(workbenchStore.files);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setIsCreating(true);

    try {
      const projectFiles: Record<string, { content: string; language?: string }> = {};
      for (const [path, dirent] of Object.entries(files)) {
        if (dirent && dirent.type === 'file') {
          projectFiles[path] = { content: dirent.content };
        }
      }

      const { saveProject } = await import('~/lib/persistence/projects');
      const project = await saveProject({
        name: projectName,
        description: projectDescription || undefined,
        files: projectFiles,
        metadata: {
          totalFiles: Object.keys(projectFiles).length,
          createdAt: new Date().toISOString(),
        },
      });

      setShowNewProjectModal(false);
      setProjectName('');
      setProjectDescription('');

      if (project) {
        onOpenProject(project.id);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Your Projects</h1>
              <p className="text-sm text-zinc-500">Create and manage your AI-built applications</p>
            </div>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <ProjectList
            onOpenProject={onOpenProject}
            onDeleteProject={onDeleteProject}
            onDuplicateProject={onDuplicateProject}
            onShareProject={onShareProject}
            onEditProject={onEditProject}
          />
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl shadow-black">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-app"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-zinc-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A brief description of what you're building..."
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-zinc-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || isCreating}
                  className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
