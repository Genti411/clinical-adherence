export type RiskLevel = 'low' | 'medium' | 'high';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'mobility' | 'stretch' | 'strength';

export interface Recommendation {
  name: string;
  type: ExerciseType;
  target_muscles: string[];
  instructions: string[];
  sets: number;
  reps: number;
  duration: string;
  equipment: string;
  weighted: boolean;
  difficulty: Difficulty;
  safety_notes: string[];
  media_prompt: string;
  animationId?: string;
}

export interface StretchResponse {
  disclaimer: string;
  risk_level: RiskLevel;
  body_area: string;
  summary: string;
  seek_medical_help_if: string[];
  recommendations: Recommendation[];
}

export const DISCLAIMER =
  'FlexAI Coach provides general fitness, stretching, and wellness information. ' +
  'It does not diagnose, treat, or replace medical advice. Stop immediately if you feel ' +
  'sharp pain, numbness, tingling, dizziness, or worsening symptoms. For serious, persistent, ' +
  'or unexplained pain, consult a licensed healthcare professional.';

export const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};
