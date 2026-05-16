// Hand-typed mirror of supabase/migrations/0001_initial.sql.
// Replace with `npm run supabase:types` output once you've linked a real project
// (the generator emits the same shape with extra metadata; postgrest-js requires
// `Relationships: GenericRelationship[]` on every table, hence the [] below).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SpringGoal =
  | 'feel_good'
  | 'lose_weight'
  | 'build_strength'
  | 'eat_better'
  | 'sleep_deeper';

export type SpringMealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type SpringThemeMode = 'light' | 'dark' | 'system';

export type SpringChatRole = 'user' | 'assistant' | 'system';

type ProfileRow = {
  user_id: string;
  name: string;
  goal: SpringGoal | null;
  wake_time: string;
  sleep_time: string;
  kcal_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml_target: number;
  accent_color: string | null;
  theme_mode: SpringThemeMode;
  created_at: string;
  updated_at: string;
};

type ProfileInsert = {
  user_id: string;
  name?: string;
  goal?: SpringGoal | null;
  wake_time?: string;
  sleep_time?: string;
  kcal_target?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  water_ml_target?: number;
  accent_color?: string | null;
  theme_mode?: SpringThemeMode;
};

type ProfileUpdate = Partial<Omit<ProfileInsert, 'user_id'>>;

type MealPlanRow = {
  id: string;
  user_id: string;
  date: string;
  slot: SpringMealSlot;
  food_name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  tags: string[];
  scheduled_time: string | null;
  created_at: string;
};

type MealPlanInsert = Omit<MealPlanRow, 'id' | 'created_at' | 'tags'> & { tags?: string[] };

type MealLogRow = {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  freeform_name: string | null;
  eaten_at: string;
  kcal: number;
  protein_g: number;
  created_at: string;
};

type MealLogInsert = Omit<MealLogRow, 'id' | 'created_at'>;

type HydrationLogRow = {
  user_id: string;
  date: string;
  cups: number;
  updated_at: string;
};

type HydrationLogInsert = {
  user_id: string;
  date: string;
  cups: number;
};

type SupplementLogRow = {
  id: string;
  user_id: string;
  date: string;
  name: string;
  taken: boolean;
};

type SupplementLogInsert = Omit<SupplementLogRow, 'id'>;

type WorkoutSessionRow = {
  id: string;
  user_id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
};

type WorkoutSessionInsert = Omit<WorkoutSessionRow, 'id' | 'started_at'> & {
  started_at?: string;
};

type WorkoutSetRow = {
  id: string;
  user_id: string;
  session_id: string;
  exercise: string;
  reps: number;
  weight_kg: number;
  completed_at: string;
};

type WorkoutSetInsert = Omit<WorkoutSetRow, 'id' | 'completed_at'> & {
  completed_at?: string;
};

type SleepLogRow = {
  user_id: string;
  date: string;
  duration_min: number;
  score: number | null;
};

type SleepLogInsert = SleepLogRow;

type ChatThreadRow = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
};

type ChatThreadInsert = Omit<ChatThreadRow, 'id' | 'created_at'>;

type ChatMessageRow = {
  id: string;
  user_id: string;
  thread_id: string;
  role: SpringChatRole;
  content: string;
  created_at: string;
};

type ChatMessageInsert = Omit<ChatMessageRow, 'id' | 'created_at'>;

type RateLimitRow = {
  user_id: string;
  bucket: string;
  window_start: string;
  count: number;
};

type RateLimitInsert = RateLimitRow;

type Table<R, I, U> = {
  Row: R;
  Insert: I;
  Update: U;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, ProfileInsert, ProfileUpdate>;
      meal_plans: Table<MealPlanRow, MealPlanInsert, Partial<MealPlanInsert>>;
      meal_logs: Table<MealLogRow, MealLogInsert, Partial<MealLogInsert>>;
      hydration_logs: Table<HydrationLogRow, HydrationLogInsert, Partial<HydrationLogInsert>>;
      supplement_logs: Table<SupplementLogRow, SupplementLogInsert, Partial<SupplementLogInsert>>;
      workout_sessions: Table<WorkoutSessionRow, WorkoutSessionInsert, Partial<WorkoutSessionInsert>>;
      workout_sets: Table<WorkoutSetRow, WorkoutSetInsert, Partial<WorkoutSetInsert>>;
      sleep_logs: Table<SleepLogRow, SleepLogInsert, Partial<SleepLogInsert>>;
      chat_threads: Table<ChatThreadRow, ChatThreadInsert, Partial<ChatThreadInsert>>;
      chat_messages: Table<ChatMessageRow, ChatMessageInsert, Partial<ChatMessageInsert>>;
      rate_limits: Table<RateLimitRow, RateLimitInsert, Partial<RateLimitInsert>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      spring_goal: SpringGoal;
      spring_meal_slot: SpringMealSlot;
      spring_theme_mode: SpringThemeMode;
      spring_chat_role: SpringChatRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
