'use client';

import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';
import {
  listExercises,
  exerciseItem,
  activityItem,
  validatePlan,
  type DraftItem,
  type DraftPlan,
  type ExerciseOption,
} from '@/lib/plan';
import { createCarePlan, listPatients, assignPlan } from '@/lib/data';

type Phase = 'build' | 'assign' | 'done';

export default function NewCarePlanPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveError, setSaveError] = useState('');
  const [phase, setPhase] = useState<Phase>('build');
  const [savedPlanId, setSavedPlanId] = useState('');
  const [patients, setPatients] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [assignError, setAssignError] = useState('');
  const [walksSteps, setWalksSteps] = useState('');
  const [swimSessions, setSwimSessions] = useState('');

  useEffect(() => {
    setExercises(listExercises());
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>New Care Plan</h1>
        <p style={{ marginTop: '1rem', color: '#888' }}>
          Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to use this feature.
        </p>
      </main>
    );
  }

  const filteredExercises = exercises.filter(ex =>
    exerciseSearch.length === 0 ||
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    ex.area.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  function addExercise(ex: ExerciseOption) {
    setItems(prev => [...prev, exerciseItem(ex.name)]);
  }

  function addWalking() {
    setItems(prev => [...prev, activityItem('walking', { stepsPerDay: Number(walksSteps) || 0 })]);
    setWalksSteps('');
  }

  function addSwimming() {
    setItems(prev => [...prev, activityItem('swimming', { sessionsPerWeek: Number(swimSessions) || 0 })]);
    setSwimSessions('');
  }

  function addWeighIn() {
    setItems(prev => [...prev, activityItem('weigh_in', { frequency: 'daily' })]);
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  const draft: DraftPlan = {
    title,
    description: description || undefined,
    duration_days: durationDays ? Number(durationDays) : undefined,
    items,
  };

  const liveErrors = validatePlan(draft);

  async function handleSave() {
    const errors = validatePlan(draft);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const client = createClient();
    if (!client) {
      setSaveError('Supabase client unavailable.');
      return;
    }

    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id ?? 'unknown';
    const orgId = (userData?.user?.user_metadata?.org_id as string) ?? 'unknown';

    const result = await createCarePlan(client, orgId, userId, draft, userId);
    if (result.error) {
      setSaveError(result.error);
      return;
    }

    setSavedPlanId(result.id!);

    // Load patients for assignment step
    const patientList = await listPatients(client, orgId);
    setPatients(patientList);
    setPhase('assign');
  }

  async function handleAssign() {
    setAssignError('');
    if (!selectedPatient) {
      setAssignError('Select a patient.');
      return;
    }

    const client = createClient();
    if (!client) {
      setAssignError('Supabase client unavailable.');
      return;
    }

    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id ?? 'unknown';
    const orgId = (userData?.user?.user_metadata?.org_id as string) ?? 'unknown';

    const result = await assignPlan(client, {
      carePlanId: savedPlanId,
      patientId: selectedPatient,
      clinicianId: userId,
      orgId,
    }, userId);

    if (result.error) {
      setAssignError(result.error);
    } else {
      setPhase('done');
    }
  }

  if (phase === 'done') {
    return (
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Care Plan Created</h1>
        <p style={{ marginTop: '1rem' }}>The care plan has been saved and assigned successfully.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1rem', color: '#0070f3' }}>Back to plans</a>
      </main>
    );
  }

  if (phase === 'assign') {
    return (
      <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Assign Care Plan</h1>
        <p style={{ marginTop: '0.5rem' }}>Plan saved (ID: {savedPlanId}). Assign to a patient:</p>

        {patients.length === 0 ? (
          <p style={{ marginTop: '1rem', color: '#888' }}>No patients found in your organisation.</p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="patient-select">Select patient</label>
            <select
              id="patient-select"
              value={selectedPatient}
              onChange={e => setSelectedPatient(e.target.value)}
              style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', width: '100%' }}
            >
              <option value="">-- choose --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? p.email ?? p.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {assignError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{assignError}</p>}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleAssign} style={{ padding: '0.5rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Assign
          </button>
          <a href="/" style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px' }}>Skip</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>New Care Plan</h1>

      {/* Plan metadata */}
      <section style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '500px' }}>
        <div>
          <label htmlFor="plan-title"><strong>Title *</strong></label>
          <input
            id="plan-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Post-surgery neck recovery"
            style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label htmlFor="plan-description">Description</label>
          <textarea
            id="plan-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label htmlFor="plan-duration">Duration (days)</label>
          <input
            id="plan-duration"
            type="number"
            min="1"
            value={durationDays}
            onChange={e => setDurationDays(e.target.value)}
            style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem', width: '120px' }}
          />
        </div>
      </section>

      {/* Exercise picker */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Exercise Library</h2>
        <input
          type="text"
          placeholder="Search exercises..."
          value={exerciseSearch}
          onChange={e => setExerciseSearch(e.target.value)}
          style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%', maxWidth: '400px' }}
          aria-label="Search exercises"
        />
        <ul style={{ marginTop: '0.75rem', listStyle: 'none', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
          {filteredExercises.map((ex, idx) => (
            <li key={`${ex.area}-${ex.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid #f4f4f4' }}>
              <span><strong>{ex.name}</strong> <span style={{ color: '#888', fontSize: '0.85em' }}>{ex.area}</span></span>
              <button
                onClick={() => addExercise(ex)}
                style={{ padding: '0.2rem 0.75rem', fontSize: '0.85em', cursor: 'pointer' }}
                aria-label={`Add ${ex.name}`}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Activity targets */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Activity Targets</h2>
        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="steps-input">Walking (steps/day)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                id="steps-input"
                type="number"
                min="1"
                value={walksSteps}
                onChange={e => setWalksSteps(e.target.value)}
                placeholder="5000"
                style={{ padding: '0.5rem', width: '100px' }}
              />
              <button onClick={addWalking} style={{ padding: '0.5rem 0.75rem' }}>Add walking</button>
            </div>
          </div>
          <div>
            <label htmlFor="swim-input">Swimming (sessions/week)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                id="swim-input"
                type="number"
                min="1"
                value={swimSessions}
                onChange={e => setSwimSessions(e.target.value)}
                placeholder="3"
                style={{ padding: '0.5rem', width: '80px' }}
              />
              <button onClick={addSwimming} style={{ padding: '0.5rem 0.75rem' }}>Add swimming</button>
            </div>
          </div>
          <div>
            <button onClick={addWeighIn} style={{ padding: '0.5rem 0.75rem' }}>Add weigh-in</button>
          </div>
        </div>
      </section>

      {/* Current items list */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Plan Items ({items.length})</h2>
        {items.length === 0 ? (
          <p style={{ color: '#888', marginTop: '0.5rem' }}>No items added yet.</p>
        ) : (
          <ul style={{ marginTop: '0.75rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((item, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid #eee', borderRadius: '4px' }}>
                <span>
                  {item.type === 'exercise' && <><strong>{item.exercise_id}</strong> (exercise)</>}
                  {item.type === 'walking' && <>Walking: {(item.target as any).stepsPerDay} steps/day</>}
                  {item.type === 'swimming' && <>Swimming: {(item.target as any).sessionsPerWeek} sessions/week</>}
                  {item.type === 'weigh_in' && <>Weigh-in: {(item.target as any).frequency}</>}
                </span>
                <button
                  onClick={() => removeItem(i)}
                  aria-label={`Remove item ${i + 1}`}
                  style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Validation errors */}
      {liveErrors.length > 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <ul style={{ color: 'red', listStyle: 'disc', paddingLeft: '1.5rem' }}>
            {liveErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </section>
      )}

      {validationErrors.length > 0 && liveErrors.length === 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <ul style={{ color: 'red', listStyle: 'disc', paddingLeft: '1.5rem' }}>
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </section>
      )}

      {saveError && <p style={{ color: 'red', marginTop: '1rem' }}>{saveError}</p>}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleSave}
          disabled={liveErrors.length > 0}
          style={{ padding: '0.6rem 2rem', background: liveErrors.length > 0 ? '#ccc' : '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: liveErrors.length > 0 ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
        >
          Save plan
        </button>
        <a href="/" style={{ padding: '0.6rem 1rem', border: '1px solid #ccc', borderRadius: '4px', lineHeight: '1.5' }}>Cancel</a>
      </div>
    </main>
  );
}
