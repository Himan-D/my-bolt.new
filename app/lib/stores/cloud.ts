import { atom } from 'nanostores';
import type { CloudSettings } from '~/lib/persistence';

export const cloudStore = atom<CloudSettings>({
  supabaseUrl: '',
  supabaseAnonKey: '',
  netlifyToken: '',
});
