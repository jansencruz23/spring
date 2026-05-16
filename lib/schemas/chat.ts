// Client-side mirror of the Zod schemas used by the Edge Functions.
// Keep in lockstep with supabase/functions/chat/index.ts and
// supabase/functions/meal-swap/index.ts.

import { z } from 'zod';

export const ChatRequestSchema = z.object({
  threadId: z.string().uuid().nullable().optional(),
  userMessage: z.string().trim().min(1).max(2000),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const MealSwapPlanInputSchema = z.object({
  food_name: z.string().min(1).max(200),
  slot: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  kcal: z.number().int().min(0).max(3000),
  protein_g: z.number().int().min(0).max(300),
  carbs_g: z.number().int().min(0).max(500),
  fat_g: z.number().int().min(0).max(300),
  tags: z.array(z.string()).max(8),
});
export type MealSwapPlanInput = z.infer<typeof MealSwapPlanInputSchema>;

export const MealSwapSuggestionSchema = z.object({
  food_name: z.string().min(1).max(200),
  kcal: z.number().int().min(0).max(3000),
  protein_g: z.number().int().min(0).max(300),
  carbs_g: z.number().int().min(0).max(500),
  fat_g: z.number().int().min(0).max(300),
  tags: z.array(z.string()).max(6).default([]),
  reason: z.string().min(1).max(300),
});
export type MealSwapSuggestion = z.infer<typeof MealSwapSuggestionSchema>;
