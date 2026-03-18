import { atom } from 'nanostores';
import type { User } from '@supabase/supabase-js';

export const userStore = atom<User | null>(null);
export const authModalOpenStore = atom<boolean>(false);
