import { atom } from 'nanostores';
import type { CloudSettings } from '~/lib/persistence';

export const cloudStore = atom<CloudSettings>({
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseServiceRoleKey: '',
  clerkPublishableKey: '',
  clerkSecretKey: '',
  mcpServerUrl: '',
  mcpApiKey: '',
  netlifyToken: '',
  githubToken: '',
  githubRepo: 'hima-app',
  githubPrivate: true,
});
