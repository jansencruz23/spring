// Placeholder — regenerate via `npm run supabase:types` after running
// `supabase link` against your project. See M0-WIRING.md.
//
// Until then, this stub provides minimal typing so the app compiles.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
