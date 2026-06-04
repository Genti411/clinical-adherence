import { DIFFICULTY_RANK, DISCLAIMER, Difficulty, Recommendation, RiskLevel, StretchResponse } from './types';

export const STRETCH_DATASET: Record<string, Recommendation[]> = {
  neck: [
    {
      name: 'Chin Tucks',
      type: 'mobility',
      target_muscles: ['deep neck flexors', 'upper neck'],
      instructions: [
        'Sit or stand tall.',
        'Gently pull your chin straight back, like making a double chin.',
        'Keep your eyes level.',
        'Hold for 5 seconds, then release.',
      ],
      sets: 2,
      reps: 10,
      duration: '5 seconds each rep',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Do not force the movement.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person sitting upright performing chin tucks, side view, neutral background, no logos.',
      animationId: 'chinTuck',
    },
    {
      name: 'Upper Trap Stretch',
      type: 'stretch',
      target_muscles: ['upper trapezius'],
      instructions: [
        'Sit tall.',
        'Gently tilt your right ear toward your right shoulder.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the stretch gentle.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person performing an upper trapezius neck stretch, front view, neutral background, no logos.',
      animationId: 'neckTiltSide',
    },
    {
      name: 'Levator Scapulae Stretch',
      type: 'stretch',
      target_muscles: ['levator scapulae'],
      instructions: [
        'Turn your head about 45 degrees to the right.',
        'Gently look down toward your armpit.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Do not pull hard on your head.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person performing a levator scapulae neck stretch, three-quarter view, neutral background, no logos.',
      animationId: 'neckTurnDown',
    },
    {
      name: 'Neck Rotation',
      type: 'mobility',
      target_muscles: ['neck rotators', 'sternocleidomastoid', 'upper trapezius'],
      instructions: [
        'Sit or stand tall with your shoulders relaxed.',
        'Slowly turn your head to look over your right shoulder, keeping your chin level.',
        'Hold for 5 seconds, then return to center.',
        'Repeat on the left side. Perform 5 rotations per side.',
      ],
      sets: 2,
      reps: 5,
      duration: '5 seconds each side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Move slowly and do not force the rotation.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person sitting tall slowly turning their head to look over one shoulder and then the other in a gentle neck rotation, side view, neutral background, no logos.',
      animationId: 'neckTurnDown',
    },
  ],
  chest: [
    {
      name: 'Doorway Chest Stretch',
      type: 'stretch',
      target_muscles: ['pectorals', 'front shoulders'],
      instructions: [
        'Place your forearms on a doorway frame.',
        'Step forward slowly until you feel a gentle stretch across your chest.',
        'Hold 20-30 seconds.',
      ],
      sets: 2,
      reps: 1,
      duration: '20-30 seconds',
      equipment: 'doorway',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the stretch gentle.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a doorway chest stretch, side view, neutral background, no logos.',
      animationId: 'chestOpen',
    },
    {
      name: 'Floor Angels',
      type: 'mobility',
      target_muscles: ['chest', 'upper back'],
      instructions: [
        'Lie on your back with knees bent.',
        'Slide your arms overhead along the floor, then back down.',
        'Move slowly and keep your low back gently flat.',
      ],
      sets: 2,
      reps: 10,
      duration: 'slow and controlled',
      equipment: 'none',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Move only as far as is comfortable.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person performing floor angels on their back, top view, neutral background, no logos.',
      animationId: 'chestOpen',
    },
    {
      name: 'Light Dumbbell Chest Opener',
      type: 'stretch',
      target_muscles: ['pectorals'],
      instructions: [
        'Lie on your back holding a light dumbbell in each hand, arms above your chest.',
        'Lower your arms out to the sides until you feel a gentle stretch.',
        'Bring them back up slowly.',
      ],
      sets: 2,
      reps: 8,
      duration: 'slow and controlled',
      equipment: 'light dumbbells',
      weighted: true,
      difficulty: 'advanced',
      safety_notes: [
        'Use very light weight.',
        'Do not let your shoulders feel strained.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a light dumbbell chest fly stretch lying on a bench, side view, neutral background, no logos.',
      animationId: 'chestOpen',
    },
  ],
  'lower back': [
    {
      name: 'Cat-Cow',
      type: 'mobility',
      target_muscles: ['spinal extensors', 'multifidus', 'abdominals'],
      instructions: [
        'Start on hands and knees, wrists under shoulders, knees under hips.',
        'Inhale and arch your back gently (cow), lifting your head and tailbone.',
        'Exhale and round your back toward the ceiling (cat), tucking chin and pelvis.',
        'Repeat slowly for 10 reps.',
      ],
      sets: 2,
      reps: 10,
      duration: 'slow and controlled',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Move only through a comfortable range.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person on all fours performing cat-cow stretch, side view, neutral background, no logos.',
      animationId: 'catCow',
    },
    {
      name: "Child's Pose",
      type: 'stretch',
      target_muscles: ['lower back', 'hips', 'glutes'],
      instructions: [
        'Kneel on the floor, then sit back toward your heels.',
        'Extend your arms forward on the floor or rest them by your sides.',
        'Lower your forehead gently toward the floor.',
        'Hold 30-60 seconds, breathing slowly.',
      ],
      sets: 1,
      reps: 1,
      duration: '30-60 seconds',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Do not force your hips down if your knees are uncomfortable.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        "Clean fitness animation of a person in child's pose stretch, side view, neutral background, no logos.",
      animationId: 'childsPose',
    },
    {
      name: 'Knee-to-Chest Stretch',
      type: 'stretch',
      target_muscles: ['lower back', 'glutes'],
      instructions: [
        'Lie on your back with knees bent.',
        'Bring one or both knees toward your chest.',
        'Hold your shins gently and breathe.',
        'Hold 20-30 seconds per side.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the pull gentle — do not force your knees.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person lying on their back pulling knees to chest, side view, neutral background, no logos.',
      animationId: 'kneeToChest',
    },
    {
      name: 'Seated Spinal Twist',
      type: 'mobility',
      target_muscles: ['spinal rotators', 'obliques'],
      instructions: [
        'Sit tall in a chair or on the floor.',
        'Place your right hand on your left knee.',
        'Gently rotate your torso to the left, keeping your spine long.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Rotate from your mid-back, not by cranking your neck.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated on the floor performing a spinal twist, three-quarter view, neutral background, no logos.',
      animationId: 'seatedTwist',
    },
  ],
  calf: [
    {
      name: 'Standing Calf Stretch Against Wall',
      type: 'stretch',
      target_muscles: ['gastrocnemius', 'soleus'],
      instructions: [
        'Face a wall and place your hands on it for support.',
        'Step one foot back, keeping that heel flat on the floor.',
        'Bend the front knee slightly and lean forward until you feel a stretch in the back calf.',
        'Hold 30 seconds, then switch sides.',
      ],
      sets: 2,
      reps: 1,
      duration: '30 seconds per side',
      equipment: 'wall',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep your back heel flat on the floor.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a standing calf stretch against a wall, side view, neutral background, no logos.',
      animationId: 'calfLunge',
    },
    {
      name: 'Seated Towel Calf Stretch',
      type: 'stretch',
      target_muscles: ['gastrocnemius', 'soleus'],
      instructions: [
        'Sit on the floor with one leg extended.',
        'Loop a towel or resistance band around the ball of your foot.',
        'Gently pull the towel toward you, flexing your foot.',
        'Hold 30 seconds per side.',
      ],
      sets: 2,
      reps: 1,
      duration: '30 seconds per side',
      equipment: 'towel or resistance band',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Pull gently — do not force the stretch.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated on the floor doing a towel-assisted calf stretch, side view, neutral background, no logos.',
      animationId: 'hamstringReach',
    },
    {
      name: 'Downward-Dog Calf Pedal',
      type: 'mobility',
      target_muscles: ['gastrocnemius', 'soleus', 'hamstrings'],
      instructions: [
        'Start in a downward-facing dog position, hands and feet on the floor, hips high.',
        'Alternately press one heel toward the floor while bending the opposite knee.',
        'Slowly pedal back and forth for 30-60 seconds.',
      ],
      sets: 2,
      reps: 1,
      duration: '30-60 seconds',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Keep a slight bend in both knees if hamstrings are very tight.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person in downward dog alternately pressing heels to floor, side view, neutral background, no logos.',
      animationId: 'calfLunge',
    },
    {
      name: 'Step Heel Drop',
      type: 'stretch',
      target_muscles: ['gastrocnemius', 'soleus', 'Achilles tendon'],
      instructions: [
        'Stand on the edge of a step with the balls of your feet on the step.',
        'Slowly lower one heel below the step level.',
        'Hold for 20-30 seconds, then raise back up.',
        'Switch sides.',
      ],
      sets: 2,
      reps: 1,
      duration: '20-30 seconds per side',
      equipment: 'step or stair',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Hold a railing for balance.',
        'Lower your heel gently — do not drop it suddenly.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a heel drop stretch on a step, side view, neutral background, no logos.',
      animationId: 'heelDrop',
    },
  ],
  shoulders: [
    {
      name: 'Cross-Body Shoulder Stretch',
      type: 'stretch',
      target_muscles: ['rear deltoid', 'rotator cuff'],
      instructions: [
        'Bring one arm across your body at shoulder height.',
        'Use your other hand to gently press the arm toward your chest.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the pressure gentle.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a cross-body shoulder stretch, front view, neutral background, no logos.',
      animationId: 'crossBodyArm',
    },
    {
      name: 'Shoulder Rolls',
      type: 'mobility',
      target_muscles: ['deltoids', 'trapezius', 'rhomboids'],
      instructions: [
        'Stand or sit tall.',
        'Roll your shoulders slowly forward in large circles, 5 times.',
        'Then roll them backward, 5 times.',
        'Move through the full comfortable range.',
      ],
      sets: 2,
      reps: 10,
      duration: 'slow and controlled',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the movement smooth and controlled.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person performing shoulder rolls, front view, neutral background, no logos.',
      animationId: 'shoulderRoll',
    },
    {
      name: 'Doorway Shoulder Opener',
      type: 'stretch',
      target_muscles: ['pectorals', 'front deltoids'],
      instructions: [
        'Stand in a doorway and place one hand on the frame at shoulder height.',
        'Gently rotate your body away from your arm until you feel a stretch across the front of the shoulder.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'doorway',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Do not force the rotation.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a doorway shoulder opener stretch, three-quarter view, neutral background, no logos.',
      animationId: 'chestOpen',
    },
    {
      name: 'Light Dumbbell External Rotation',
      type: 'strength',
      target_muscles: ['infraspinatus', 'teres minor', 'rotator cuff'],
      instructions: [
        'Hold a very light dumbbell in one hand.',
        'Tuck your elbow against your side at 90 degrees.',
        'Slowly rotate your forearm outward away from your body, then return.',
        'Complete all reps, then switch sides.',
      ],
      sets: 2,
      reps: 12,
      duration: 'slow and controlled',
      equipment: 'light dumbbell',
      weighted: true,
      difficulty: 'advanced',
      safety_notes: [
        'Use a very light weight — this is a rehab-style exercise.',
        'Keep your elbow pinned to your side throughout.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person performing dumbbell external shoulder rotation standing, side view, neutral background, no logos.',
      animationId: 'crossBodyArm',
    },
    {
      name: 'Overhead Triceps Stretch',
      type: 'stretch',
      target_muscles: ['triceps', 'long head of triceps'],
      instructions: [
        'Sit or stand tall.',
        'Raise your right arm overhead and bend the elbow so your right hand reaches toward your upper back.',
        'Place your left hand gently on your right elbow and apply light downward pressure.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the pressure on the elbow gentle.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person sitting or standing with one arm raised overhead and bent at the elbow, the other hand gently pressing the elbow down in an overhead triceps stretch, side view, neutral background, no logos.',
      animationId: 'shoulderRoll',
    },
  ],
  hamstrings: [
    {
      name: 'Standing Hamstring Stretch',
      type: 'stretch',
      target_muscles: ['hamstrings'],
      instructions: [
        'Stand tall and extend one leg forward, heel on the floor, toes up.',
        'Hinge forward slightly at the hips, keeping your back flat.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Do not round your lower back.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a standing hamstring stretch, side view, neutral background, no logos.',
      animationId: 'hamstringReach',
    },
    {
      name: 'Supine Hamstring Stretch with Towel',
      type: 'stretch',
      target_muscles: ['hamstrings'],
      instructions: [
        'Lie on your back with both knees bent.',
        'Loop a towel around the sole of one foot.',
        'Gently straighten that leg toward the ceiling until you feel a stretch.',
        'Hold 30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '30 seconds per side',
      equipment: 'towel',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the opposite foot flat on the floor.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person lying on their back doing a towel-assisted hamstring stretch, side view, neutral background, no logos.',
      animationId: 'hamstringReach',
    },
    {
      name: 'Seated Forward Fold',
      type: 'stretch',
      target_muscles: ['hamstrings', 'lower back'],
      instructions: [
        'Sit on the floor with both legs extended in front of you.',
        'Sit tall, then hinge forward from the hips, reaching toward your feet.',
        'Hold the furthest comfortable position for 30-60 seconds.',
      ],
      sets: 2,
      reps: 1,
      duration: '30-60 seconds',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Keep your back as flat as possible; do not round excessively.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated on the floor in a forward fold stretch, side view, neutral background, no logos.',
      animationId: 'hamstringReach',
    },
  ],
  hips: [
    {
      name: 'Figure-Four Glute Stretch',
      type: 'stretch',
      target_muscles: ['piriformis', 'glutes', 'hip external rotators'],
      instructions: [
        'Lie on your back with both knees bent and feet flat on the floor.',
        'Cross your right ankle over your left bent knee, forming a figure-four shape.',
        'Interlace your hands behind your left thigh and gently pull it toward your chest.',
        'Hold 30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the pull on your thigh, not your knee.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person lying on their back with one ankle crossed over the opposite bent knee, hands pulling the thigh toward the chest in a figure-four stretch, side view, neutral background, no logos.',
      animationId: 'kneeToChest',
    },
    {
      name: 'Standing Hip Flexor Lunge',
      type: 'stretch',
      target_muscles: ['hip flexors', 'iliopsoas', 'quadriceps'],
      instructions: [
        'Kneel on your right knee with your left foot forward in a half-kneeling position.',
        'Keep your torso upright and gently tuck your pelvis under.',
        'Shift your weight slightly forward until you feel a stretch at the front of your right hip.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Place a folded towel under your knee for comfort if needed.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person in a half-kneeling lunge, side view, gently tucking the pelvis to feel a stretch at the front of the back hip, neutral background, no logos.',
      animationId: 'calfLunge',
    },
    {
      name: 'Seated Figure-Four',
      type: 'stretch',
      target_muscles: ['piriformis', 'glutes', 'hip external rotators'],
      instructions: [
        'Sit tall in a chair with your feet flat on the floor.',
        'Cross your right ankle over your left knee, letting the right knee drop to the side.',
        'Sit up tall, then gently hinge forward from the hips until you feel a stretch in your right glute.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'chair',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Do not round your lower back — hinge from the hips.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated in a chair with one ankle resting on the opposite knee, hinging gently forward from the hips in a seated figure-four stretch, side view, neutral background, no logos.',
      animationId: 'seatedTwist',
    },
  ],
  wrists: [
    {
      name: 'Wrist Flexor Stretch',
      type: 'stretch',
      target_muscles: ['wrist flexors', 'forearm flexors'],
      instructions: [
        'Extend your right arm in front of you at shoulder height, palm facing up.',
        'With your left hand, gently draw your right fingers down and back toward your body.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Apply gentle pressure only — do not force the stretch.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person extending one arm forward palm up while the other hand gently draws the fingers down and back in a wrist flexor stretch, front view, neutral background, no logos.',
      animationId: 'crossBodyArm',
    },
    {
      name: 'Wrist Extensor Stretch',
      type: 'stretch',
      target_muscles: ['wrist extensors', 'forearm extensors'],
      instructions: [
        'Extend your right arm in front of you at shoulder height, palm facing down.',
        'With your left hand, gently press the back of your right hand downward toward the floor.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Apply gentle pressure — do not force the wrist.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person extending one arm forward palm down while the other hand gently presses the hand downward in a wrist extensor stretch, front view, neutral background, no logos.',
      animationId: 'crossBodyArm',
    },
    {
      name: 'Prayer Stretch',
      type: 'stretch',
      target_muscles: ['wrist flexors', 'forearm muscles'],
      instructions: [
        'Press your palms together at chest height in a prayer position.',
        'Slowly lower your joined hands toward your waist while keeping the palms pressed firmly together.',
        'Hold the lowest comfortable position for 20-30 seconds.',
      ],
      sets: 2,
      reps: 1,
      duration: '20-30 seconds',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the movement slow and controlled.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person pressing palms together at chest height and slowly lowering the joined hands while keeping the palms together in a prayer wrist stretch, front view, neutral background, no logos.',
      animationId: 'chestOpen',
    },
  ],
  'upper back': [
    {
      name: 'Thread the Needle',
      type: 'mobility',
      target_muscles: ['thoracic rotators', 'rhomboids', 'upper trapezius'],
      instructions: [
        'Start on hands and knees, with wrists under shoulders and knees under hips.',
        'Slide your right arm underneath your body along the floor, rotating your upper back to the right.',
        'Let your right shoulder and ear rest on the mat, then hold for 20-30 seconds.',
        'Return to the start and switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Move slowly and do not force the rotation.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person on hands and knees threading one arm underneath the body to rotate the upper back, with that shoulder and cheek resting on the mat, three-quarter view, neutral background, no logos.',
      animationId: 'seatedTwist',
    },
    {
      name: 'Seated Thoracic Extension',
      type: 'mobility',
      target_muscles: ['thoracic extensors', 'erector spinae'],
      instructions: [
        'Sit upright in a sturdy chair with your feet flat on the floor.',
        'Interlace your fingers and place your hands behind your head.',
        'Gently arch your upper back over the top edge of the chair back, looking slightly upward.',
        'Hold for 3-5 seconds, then return to upright. Repeat 5-8 times.',
      ],
      sets: 2,
      reps: 8,
      duration: '3-5 seconds each rep',
      equipment: 'chair',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Use the chair back as a fulcrum only at the upper back — not the lower back.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated in a chair with hands behind the head, gently arching the upper back over the chair back in a thoracic extension, side view, neutral background, no logos.',
      animationId: 'catCow',
    },
    {
      name: 'Wall Angels',
      type: 'mobility',
      target_muscles: ['rhomboids', 'lower trapezius', 'thoracic extensors'],
      instructions: [
        'Stand with your back, head, and heels touching a wall.',
        'Raise your arms to form a W shape with elbows bent and backs of your hands against the wall.',
        'Slowly slide your arms up the wall into a Y shape, then back down.',
        'Repeat 8-10 times, keeping contact with the wall throughout.',
      ],
      sets: 2,
      reps: 10,
      duration: 'slow and controlled',
      equipment: 'wall',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Keep your lower back gently pressed against the wall — avoid arching.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person standing with their back flat against a wall, sliding arms up and down like a snow angel in wall angels exercise, side-front view, neutral background, no logos.',
      animationId: 'chestOpen',
    },
  ],
  ankles: [
    {
      name: 'Ankle Circles',
      type: 'mobility',
      target_muscles: ['ankle stabilizers', 'peroneals', 'tibialis anterior'],
      instructions: [
        'Sit in a chair or on the floor with one foot lifted off the ground.',
        'Slowly circle your foot in a large clockwise circle 10 times.',
        'Then circle counterclockwise 10 times.',
        'Switch feet and repeat.',
      ],
      sets: 1,
      reps: 2,
      duration: '10 circles each direction per foot',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Move slowly and through the full comfortable range of motion.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated with one foot lifted, slowly circling the ankle in both directions, side view, neutral background, no logos.',
      animationId: 'heelDrop',
    },
    {
      name: 'Seated Ankle Dorsiflexion',
      type: 'stretch',
      target_muscles: ['gastrocnemius', 'soleus', 'Achilles tendon'],
      instructions: [
        'Sit tall in a chair with both feet flat on the floor.',
        'Lift the toes and front of one foot, keeping your heel on the ground.',
        'Gently pull your foot further back toward your shin with your hand if comfortable.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Keep the movement gentle.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person seated in a chair gently pulling the toes and foot up toward the shin in an ankle dorsiflexion stretch, side view, neutral background, no logos.',
      animationId: 'heelDrop',
    },
    {
      name: 'Standing Ankle Rocks',
      type: 'mobility',
      target_muscles: ['ankle stabilizers', 'gastrocnemius', 'tibialis anterior'],
      instructions: [
        'Stand tall with your feet hip-width apart, holding a wall or chair back for balance.',
        'Slowly rock your body weight forward onto your toes.',
        'Then gently rock back so your weight shifts toward your heels.',
        'Repeat 10-15 times in a slow, controlled rhythm.',
      ],
      sets: 2,
      reps: 15,
      duration: 'slow and controlled',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Hold a wall or chair for balance throughout.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person standing and slowly rocking body weight forward over the toes and back in standing ankle rocks, side view, neutral background, no logos.',
      animationId: 'calfLunge',
    },
  ],
  'post-workout': [
    {
      name: "Child's Pose",
      type: 'stretch',
      target_muscles: ['lower back', 'hips', 'shoulders'],
      instructions: [
        'Kneel on the floor, then sit back toward your heels.',
        'Extend your arms forward and lower your forehead toward the floor.',
        'Breathe deeply and hold 30-60 seconds.',
      ],
      sets: 1,
      reps: 1,
      duration: '30-60 seconds',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Modify by placing a folded blanket under your knees if needed.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        "Clean fitness animation of a person in child's pose stretch, side view, neutral background, no logos.",
      animationId: 'childsPose',
    },
    {
      name: 'Standing Quad Stretch',
      type: 'stretch',
      target_muscles: ['quadriceps', 'hip flexors'],
      instructions: [
        'Stand on one leg and bring your other heel toward your glutes.',
        'Hold your ankle gently and keep your knees together.',
        'Hold 20-30 seconds, then switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '20-30 seconds per side',
      equipment: 'none',
      weighted: false,
      difficulty: 'beginner',
      safety_notes: [
        'Use a wall for balance if needed.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a standing quad stretch, side view, neutral background, no logos.',
      animationId: 'quadStretch',
    },
    {
      name: "World's Greatest Stretch",
      type: 'mobility',
      target_muscles: ['hip flexors', 'thoracic spine', 'hamstrings', 'groin'],
      instructions: [
        'Start in a push-up position.',
        'Step your right foot outside your right hand.',
        'Lower your left knee to the floor.',
        'Rotate your right arm toward the ceiling, following with your eyes.',
        'Hold briefly, return, and switch sides. Repeat 5 times per side.',
      ],
      sets: 2,
      reps: 5,
      duration: 'slow and controlled',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Move slowly through each step.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        "Clean fitness animation of a person performing the world's greatest stretch lunge with thoracic rotation, side view, neutral background, no logos.",
      animationId: 'calfLunge',
    },
    {
      name: 'Pigeon Pose Hip Opener',
      type: 'stretch',
      target_muscles: ['piriformis', 'glutes', 'hip flexors'],
      instructions: [
        'From a push-up position, bring your right knee forward toward your right wrist.',
        'Let your right shin rest on the floor at an angle.',
        'Lower your hips and hold 30-60 seconds.',
        'Switch sides.',
      ],
      sets: 1,
      reps: 2,
      duration: '30-60 seconds per side',
      equipment: 'yoga mat',
      weighted: false,
      difficulty: 'intermediate',
      safety_notes: [
        'Place a folded blanket under your hip if it does not touch the floor.',
        'Stop if you feel sharp pain, numbness, tingling, or dizziness.',
      ],
      media_prompt:
        'Clean fitness animation of a person doing a pigeon pose hip stretch on the floor, front-angle view, neutral background, no logos.',
      animationId: 'childsPose',
    },
  ],
};

const AREA_SUMMARY: Record<string, string> = {
  neck: 'These gentle stretches may help with general neck tightness.',
  chest: 'These moves may help open up a tight chest.',
  'lower back': 'These gentle movements may help with general lower-back tightness.',
  calf: 'These stretches may help with general calf tightness.',
  shoulders: 'These moves may help with general shoulder tightness or soreness.',
  hamstrings: 'These stretches may help with general hamstring tightness.',
  'post-workout': 'These gentle moves may help you cool down and recover after a workout.',
  hips: 'These moves may help open tight hips and glutes.',
  wrists: 'These gentle stretches may help with wrist and forearm tightness.',
  'upper back': 'These moves may help with mid-back and upper-back tightness.',
  ankles: 'These gentle moves may help with ankle mobility.',
};

const SEEK_HELP = [
  'sharp pain',
  'numbness or tingling',
  'dizziness',
  'pain after an accident',
  'symptoms that worsen or do not improve',
];

export interface BuildOptions {
  wantsWeights: boolean;
  difficulty: Difficulty;
  riskLevel: RiskLevel;
}

export function buildResponse(area: string, opts: BuildOptions): StretchResponse {
  const all = STRETCH_DATASET[area] ?? [];
  const maxRank = DIFFICULTY_RANK[opts.difficulty];
  const allowWeights = opts.wantsWeights && opts.riskLevel === 'low';

  const recommendations = all.filter((r) => {
    if (DIFFICULTY_RANK[r.difficulty] > maxRank) return false;
    if (r.weighted && !allowWeights) return false;
    return true;
  });

  const summary =
    opts.riskLevel === 'medium'
      ? `${AREA_SUMMARY[area] ?? 'These gentle moves may help.'} Because this has been bothering you, consider seeing a healthcare professional if symptoms persist.`
      : AREA_SUMMARY[area] ?? 'These gentle moves may help.';

  return {
    disclaimer: DISCLAIMER,
    risk_level: opts.riskLevel,
    body_area: area,
    summary,
    seek_medical_help_if: SEEK_HELP,
    recommendations,
  };
}
