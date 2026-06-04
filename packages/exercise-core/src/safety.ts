import { DISCLAIMER, RiskLevel, StretchResponse } from './types';

const HIGH_RISK_KEYWORDS = [
  'sharp pain', 'numbness', 'numb', 'tingling', 'swelling', 'swollen',
  "can't move", 'cant move', 'cannot move', 'injury', 'injured', 'fall', 'fell',
  'accident', 'chest pain', 'shortness of breath', "can't breathe", 'cant breathe',
  'severe pain',
];

const MEDIUM_RISK_PATTERNS = [
  'keeps coming back', 'recurring', 'persistent', 'for weeks', 'for months',
  'hurts when lifting', 'hurts when i lift', 'pain when lifting', 'hurts when i run',
];

export interface SafetyResult {
  risk: RiskLevel;
  matched: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Match each keyword on word boundaries so a keyword is not flagged when it is only
// a substring of an unrelated word (e.g. "numb" inside "number", "fall" inside
// "fallback"). Conservative by design: real high-risk phrasing still matches.
function matchKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter((k) => new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i').test(text));
}

export function classifyRisk(input: string): SafetyResult {
  const high = matchKeywords(input, HIGH_RISK_KEYWORDS);
  if (high.length) return { risk: 'high', matched: high };
  const medium = matchKeywords(input, MEDIUM_RISK_PATTERNS);
  if (medium.length) return { risk: 'medium', matched: medium };
  return { risk: 'low', matched: [] };
}

export const HIGH_RISK_SUMMARY =
  "I'm sorry you're dealing with that. Because you mentioned symptoms that could be " +
  'serious (such as severe pain, numbness, tingling, swelling, or a recent injury), I ' +
  "can't safely recommend stretches or exercises. Please contact a licensed healthcare " +
  'professional or urgent care. If this feels like an emergency, call your local emergency number.';

export function highRiskResponse(): StretchResponse {
  return {
    disclaimer: DISCLAIMER,
    risk_level: 'high',
    body_area: 'unknown',
    summary: HIGH_RISK_SUMMARY,
    seek_medical_help_if: [
      'sharp or severe pain',
      'numbness or tingling',
      'swelling or inability to move a limb',
      'pain after an accident or fall',
      'chest pain or shortness of breath',
    ],
    recommendations: [],
  };
}
