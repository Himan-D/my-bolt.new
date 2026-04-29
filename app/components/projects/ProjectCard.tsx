import type { Project } from '~/lib/persistence/projects';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShare: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ProjectCard({ project, onOpen, onDelete, onDuplicate, onShare, onEdit }: ProjectCardProps) {
  const timeAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group relative bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail/Preview Area */}
      <div className="h-32 sm:h-36 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 left-2 w-8 h-8 border border-zinc-700 rounded" />
          <div className="absolute top-4 left-4 w-16 h-12 border border-zinc-700 rounded-sm" />
          <div className="absolute bottom-2 left-2 w-20 h-3 bg-zinc-700 rounded-sm" />
        </div>
        <div className="text-2xl">📦</div>

        {/* Quick actions on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(project.id);
            }}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors"
          >
            Open
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(project.id);
            }}
            className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-white truncate flex-1">{project.name}</h3>
        </div>

        {project.description && <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{project.description}</p>}

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {project.metadata?.totalFiles && (
              <span className="px-2 py-0.5 bg-zinc-800 text-xs rounded-full text-zinc-400">
                {project.metadata.totalFiles} files
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-600">{timeAgo}</span>
        </div>

        {/* Actions (shown on hover) */}
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project.id);
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(project.id);
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
