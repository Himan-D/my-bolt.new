import { type ActionFunctionArgs, json } from '@remix-run/node';
import { deleteProject, duplicateProject, getAllProjects, getProject } from '~/lib/persistence/projects';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');
  const projectId = formData.get('projectId') as string;

  try {
    switch (action) {
      case 'delete':
        if (projectId) {
          await deleteProject(projectId);
          return json({ success: true, message: 'Project deleted successfully' });
        }
        return json({ success: false, message: 'Project ID required' }, { status: 400 });

      case 'duplicate':
        if (projectId) {
          const newProject = await duplicateProject(projectId);
          return json({ success: true, project: newProject, message: 'Project duplicated successfully' });
        }
        return json({ success: false, message: 'Project ID required' }, { status: 400 });

      case 'get':
        if (projectId) {
          const project = await getProject(projectId);
          return json({ success: true, project });
        }
        return json({ success: false, message: 'Project ID required' }, { status: 400 });

      case 'list':
        const projects = await getAllProjects();
        return json({ success: true, projects });

      default:
        return json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    return json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
