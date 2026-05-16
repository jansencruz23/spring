import { supabase } from '../supabase';
import type { Database } from '../database.types';

export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type WorkoutSet = Database['public']['Tables']['workout_sets']['Row'];

/**
 * The user's active session is the most-recent row in `workout_sessions` with
 * a null `ended_at`. There should only ever be one — we don't enforce this at
 * the SQL level, so the query orders by `started_at desc` and picks the head.
 */
export async function getActiveSession(userId: string): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function startSession(userId: string, name: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      name,
      started_at: new Date().toISOString(),
      ended_at: null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function endSession(userId: string, sessionId: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', sessionId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getSessionSets(userId: string, sessionId: string): Promise<WorkoutSet[]> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('completed_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type LogSetInput = {
  exercise: string;
  reps: number;
  weightKg: number;
};

export async function logSet(
  userId: string,
  sessionId: string,
  input: LogSetInput,
): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from('workout_sets')
    .insert({
      user_id: userId,
      session_id: sessionId,
      exercise: input.exercise,
      reps: input.reps,
      weight_kg: input.weightKg,
      completed_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
