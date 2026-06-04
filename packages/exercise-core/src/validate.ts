import { Difficulty, ExerciseType, Recommendation, RiskLevel, StretchResponse } from './types';

const RISK: RiskLevel[] = ['low', 'medium', 'high'];
const DIFF: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const TYPES: ExerciseType[] = ['mobility', 'stretch', 'strength'];

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function isRecommendation(v: unknown): v is Recommendation {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.name === 'string' &&
    TYPES.includes(r.type as ExerciseType) &&
    isStringArray(r.target_muscles) &&
    isStringArray(r.instructions) &&
    typeof r.sets === 'number' &&
    typeof r.reps === 'number' &&
    typeof r.duration === 'string' &&
    typeof r.equipment === 'string' &&
    typeof r.weighted === 'boolean' &&
    DIFF.includes(r.difficulty as Difficulty) &&
    isStringArray(r.safety_notes) &&
    typeof r.media_prompt === 'string'
  );
}

export function validateResponse(v: unknown): v is StretchResponse {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.disclaimer === 'string' &&
    RISK.includes(r.risk_level as RiskLevel) &&
    typeof r.body_area === 'string' &&
    typeof r.summary === 'string' &&
    isStringArray(r.seek_medical_help_if) &&
    Array.isArray(r.recommendations) &&
    r.recommendations.every(isRecommendation)
  );
}

export function sanitize(res: StretchResponse, risk: RiskLevel): StretchResponse {
  if (risk === 'low') return res;
  return { ...res, recommendations: res.recommendations.filter((r) => !r.weighted) };
}
