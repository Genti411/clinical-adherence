import { Difficulty } from './types';

export interface MatchResult {
  bodyArea: string | null;
  wantsWeights: boolean;
  difficulty: Difficulty;
}

const BODY_AREA_KEYWORDS: [string, string[]][] = [
  ['neck', ['neck', 'traps', 'trapezius', 'crick']],
  ['lower back', ['lower back', 'low back', 'lumbar', 'lower-back']],
  ['calf', ['calf', 'calves', 'gastrocnemius']],
  ['shoulders', ['shoulder', 'shoulders', 'delts', 'rotator cuff']],
  ['hamstrings', ['hamstring', 'hamstrings', 'back of my leg', 'back of the thigh']],
  ['chest', ['chest', 'pecs', 'pectoral']],
  ['hips', ['hip', 'hips', 'glute', 'glutes', 'piriformis']],
  ['wrists', ['wrist', 'wrists', 'forearm', 'forearms']],
  ['upper back', ['upper back', 'mid back', 'mid-back', 'between my shoulder blades', 'thoracic', 'rhomboid']],
  ['ankles', ['ankle', 'ankles']],
  ['post-workout', ['post workout', 'post-workout', 'after working out', 'after my workout', 'leg day', 'after lifting', 'after a workout']],
];

const WEIGHT_KEYWORDS = ['weight', 'weights', 'dumbbell', 'dumbbells', 'kettlebell', 'resistance band', 'goblet', 'barbell'];

function detectDifficulty(text: string): Difficulty {
  if (text.includes('advanced')) return 'advanced';
  if (text.includes('intermediate')) return 'intermediate';
  return 'beginner';
}

export function matchInput(input: string): MatchResult {
  const text = input.toLowerCase();
  let bodyArea: string | null = null;
  for (const [area, keywords] of BODY_AREA_KEYWORDS) {
    if (keywords.some((k) => text.includes(k))) {
      bodyArea = area;
      break;
    }
  }
  const wantsWeights = WEIGHT_KEYWORDS.some((k) => text.includes(k));
  return { bodyArea, wantsWeights, difficulty: detectDifficulty(text) };
}
