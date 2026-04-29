import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getAllProjects } from '~/lib/persistence/projects';

export const loader = async (_args: LoaderFunctionArgs) => {
  const projects = await getAllProjects();
  return json({ projects });
};
