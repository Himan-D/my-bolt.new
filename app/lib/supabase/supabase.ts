import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cloudStore } from '~/lib/stores/cloud';

let supabaseInstance: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey } = cloudStore.get();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // re-init if keys changed
  if (supabaseInstance === null || supabaseUrl !== currentUrl || supabaseAnonKey !== currentKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      currentUrl = supabaseUrl;
      currentKey = supabaseAnonKey;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}
