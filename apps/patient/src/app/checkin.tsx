import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { saveOutcome } from '@/lib/care';
import { DAILY_FUNCTION, validateAnswers, scoreProm } from '@/lib/proms';

function NotConfigured() {
  return (
    <View style={styles.center}>
      <Text style={styles.notice}>
        Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
      </Text>
    </View>
  );
}

interface AnswerState {
  [questionId: string]: string;
}

export default function CheckInScreen() {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!isSupabaseConfigured) return <NotConfigured />;

  const setAnswer = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const parsedAnswers = (): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const q of DAILY_FUNCTION.questions) {
      const raw = answers[q.id];
      out[q.id] = raw !== undefined ? parseFloat(raw) : NaN;
    }
    return out;
  };

  const handleSubmit = async () => {
    const nums = parsedAnswers();
    const errs = validateAnswers(DAILY_FUNCTION, nums);
    setErrors(errs);
    if (errs.length > 0) return;

    const computed = scoreProm(DAILY_FUNCTION, nums);

    setSaving(true);
    setSaveError('');
    try {
      if (supabase) {
        const session = await getSession();
        const userId = session?.user.id ?? '';
        // org_id comes from user metadata; fall back to empty for unconfigured
        const orgId = (session?.user?.user_metadata?.org_id as string) ?? '';
        const result = await saveOutcome(supabase, {
          patientId: userId,
          orgId,
          instrument: DAILY_FUNCTION.id,
          score: computed,
        });
        if (!result.ok) {
          setSaveError(result.error ?? 'Failed to save.');
          setSaving(false);
          return;
        }
      }
      setScore(computed);
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  };

  if (submitted && score !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Thank you!</Text>
          <Text style={styles.scoreLabel} testID="score-display">
            Your score: {score} / 100
          </Text>
          <Text style={styles.notice}>{DAILY_FUNCTION.scoreLabel}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{DAILY_FUNCTION.name}</Text>
        <Text style={styles.subtitle}>Rate each on 0-10</Text>

        {DAILY_FUNCTION.questions.map((q) => (
          <View key={q.id} style={styles.questionBlock} testID={`question-${q.id}`}>
            <Text style={styles.questionText}>{q.text}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder={`${q.min} - ${q.max}`}
              value={answers[q.id] ?? ''}
              onChangeText={(v) => setAnswer(q.id, v)}
              testID={`input-${q.id}`}
            />
          </View>
        ))}

        {errors.map((e, i) => (
          <Text key={i} style={styles.error} testID={`error-${i}`}>{e}</Text>
        ))}

        {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

        <Pressable
          style={styles.btn}
          onPress={handleSubmit}
          disabled={saving}
          testID="submit-checkin-btn"
        >
          <Text style={styles.btnText}>{saving ? 'Saving...' : 'Submit check-in'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notice: { fontSize: 14, color: '#555', textAlign: 'center', marginTop: 8 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 20, textAlign: 'center' },
  scoreLabel: { fontSize: 22, fontWeight: '700', color: '#2F8F83', marginTop: 12, textAlign: 'center' },
  questionBlock: { marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: '500', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  error: { color: '#B42318', fontSize: 14, marginBottom: 6 },
  btn: { backgroundColor: '#2F8F83', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
