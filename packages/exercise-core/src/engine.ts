import { buildResponse } from './dataset';
import { matchInput } from './matcher';
import { classifyRisk, highRiskResponse } from './safety';
import { DISCLAIMER, StretchResponse } from './types';

function fallbackResponse(): StretchResponse {
  return {
    disclaimer: DISCLAIMER,
    risk_level: 'low',
    body_area: 'unknown',
    summary:
      "I'm not sure I caught that. Try telling me which area feels tense - for example: neck, " +
      'lower back, calf, shoulders, hamstrings, or chest - or pick one of the suggestions.',
    seek_medical_help_if: [],
    recommendations: [],
  };
}

export async function getStretchResponse(input: string): Promise<StretchResponse> {
  const safety = classifyRisk(input);
  if (safety.risk === 'high') return highRiskResponse();

  const match = matchInput(input);
  if (match.bodyArea) {
    return buildResponse(match.bodyArea, { wantsWeights: match.wantsWeights, difficulty: match.difficulty, riskLevel: safety.risk });
  }

  return fallbackResponse();
}
