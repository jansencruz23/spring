/**
 * Default v1 workout routine — the "Strong & steady lower body" session from
 * the prototype. We don't persist routine definitions to the DB yet; the user
 * journey for v1 is "start the default session → log sets against it". Custom
 * routines and progression are v1.1 territory.
 *
 * Targets here drive the UI (how many sets per exercise, the prescribed reps
 * and weight). Actual completed reps/weight come from `workout_sets` rows.
 */

export type RoutineExercise = {
  /** Stable id used in the UI and as the `exercise` column on workout_sets. */
  id: string;
  name: string;
  /** Number of working sets the routine prescribes. */
  targetSets: number;
  /** Prescribed reps per set. */
  targetReps: number;
  /** Prescribed weight (kg). `null` means bodyweight / "each side" etc. */
  targetWeightKg: number | null;
  /** Short detail shown under the exercise name ("20 kg" or "each side"). */
  detail: string;
};

export type Routine = {
  /** Stored as workout_sessions.name when a session starts. */
  name: string;
  /** Eyebrow text shown above the title in the workout header. */
  eyebrow: string;
  /** Italic emphasis half of the title (first line in the header). */
  titleEmphasis: string;
  /** Regular-weight half of the title (second line in the header). */
  titleRest: string;
  /** Rest seconds prescribed between sets. */
  restSeconds: number;
  exercises: RoutineExercise[];
};

export const DEFAULT_ROUTINE: Routine = {
  name: 'Strong & steady lower body',
  eyebrow: 'Lower body · day 3 of 4',
  titleEmphasis: 'Strong & steady',
  titleRest: 'lower body',
  restSeconds: 60,
  exercises: [
    { id: 'goblet-squat',       name: 'Goblet squat',      targetSets: 3, targetReps: 10, targetWeightKg: 20, detail: '20 kg' },
    { id: 'romanian-deadlift',  name: 'Romanian deadlift', targetSets: 3, targetReps: 8,  targetWeightKg: 40, detail: '40 kg' },
    { id: 'walking-lunges',     name: 'Walking lunges',    targetSets: 3, targetReps: 12, targetWeightKg: null, detail: 'each side' },
    { id: 'glute-bridge',       name: 'Glute bridge',      targetSets: 3, targetReps: 12, targetWeightKg: 30, detail: '30 kg' },
    { id: 'calf-raise',         name: 'Calf raise',        targetSets: 2, targetReps: 15, targetWeightKg: null, detail: 'bodyweight' },
  ],
};

export const TOTAL_TARGET_SETS = DEFAULT_ROUTINE.exercises.reduce(
  (sum, ex) => sum + ex.targetSets,
  0,
);
