import { supabase } from '@/lib/supabase';

export type Result = { ok: true } | { ok: false; error: string };

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function sendCode(email: string): Promise<Result> {
  if (!supabase) return { ok: false, error: 'Cloud sync is not configured' };
  const { error } = await supabase.auth.signInWithOtp({ email });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function verifyCode(email: string, token: string): Promise<Result> {
  if (!supabase) return { ok: false, error: 'Cloud sync is not configured' };
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}
