import { supabase } from '../supabase';
import { isoToday } from '../util/time';

export type Supplement = {
  id: 'vit_d' | 'omega_3' | 'creatine' | 'magnesium';
  name: string;
  sub: string;
  tint: 'butter' | 'coral' | 'sage' | 'plum';
};

export const SUPPLEMENTS_V1: Supplement[] = [
  { id: 'vit_d',     name: 'Vitamin D3', sub: 'with breakfast · 2000 IU', tint: 'butter' },
  { id: 'omega_3',   name: 'Omega-3',    sub: 'with breakfast · 1000 mg', tint: 'coral' },
  { id: 'creatine',  name: 'Creatine',   sub: 'after workout · 5 g',      tint: 'sage' },
  { id: 'magnesium', name: 'Magnesium',  sub: 'before bed · 400 mg',      tint: 'plum' },
];

export type SupplementLog = {
  id: string;
  user_id: string;
  date: string;
  name: string;
  taken: boolean;
};

export async function getSupplementsForDate(
  userId: string,
  date = isoToday(),
): Promise<SupplementLog[]> {
  const { data, error } = await supabase
    .from('supplement_logs')
    .select('id, user_id, date, name, taken')
    .eq('user_id', userId)
    .eq('date', date);
  if (error) throw error;
  return data ?? [];
}

export async function setSupplementTaken(
  userId: string,
  name: Supplement['id'],
  taken: boolean,
  date = isoToday(),
): Promise<SupplementLog> {
  const { data, error } = await supabase
    .from('supplement_logs')
    .upsert(
      { user_id: userId, date, name, taken },
      { onConflict: 'user_id,date,name' },
    )
    .select('id, user_id, date, name, taken')
    .single();
  if (error) throw error;
  return data;
}
