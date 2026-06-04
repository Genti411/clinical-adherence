import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getSession, sendCode, verifyCode } from '@/lib/auth';
import { getActiveAssignment, getPlanItems, getTodayLogs, markDone } from '@/lib/care';
import { buildChecklist, adherencePercent, ChecklistEntry } from '@/lib/today';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// --- Not configured ---
function NotConfigured() {
  return (
    <View style={styles.center}>
      <Text style={styles.notice}>
        Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
      </Text>
    </View>
  );
}

// --- Sign-in (email OTP) ---
function SignIn() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setError('');
    const r = await sendCode(email);
    setLoading(false);
    if (r.ok) setStep('code');
    else setError(r.error);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    const r = await verifyCode(email, code);
    setLoading(false);
    if (!r.ok) setError(r.error);
  };

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Sign in</Text>
      {step === 'email' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Pressable style={styles.btn} onPress={handleSend} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Sending...' : 'Send code'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="One-time code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <Pressable style={styles.btn} onPress={handleVerify} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Verifying...' : 'Verify'}</Text>
          </Pressable>
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// --- Today checklist ---
interface TodayProps {
  userId: string;
}

function TodayScreen({ userId }: TodayProps) {
  const [loading, setLoading] = useState(true);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [entries, setEntries] = useState<ChecklistEntry[]>([]);
  const today = isoDate(new Date());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) return;
      setLoading(true);
      const assignment = await getActiveAssignment(supabase, userId);
      if (cancelled) return;

      if (!assignment) {
        setLoading(false);
        return;
      }

      setAssignmentId(assignment.id);
      setOrgId(assignment.org_id);
      setCarePlanId(assignment.care_plan_id);

      const [items, logs] = await Promise.all([
        getPlanItems(supabase, assignment.care_plan_id),
        getTodayLogs(supabase, assignment.id, today),
      ]);

      if (cancelled) return;
      setEntries(buildChecklist(items, logs));
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [userId, today]);

  const toggle = useCallback(async (entry: ChecklistEntry) => {
    if (!supabase || !assignmentId || !orgId) return;

    // Optimistic update
    const newCompleted = !entry.completed;
    setEntries((prev) =>
      prev.map((e) => (e.itemId === entry.itemId ? { ...e, completed: newCompleted } : e))
    );

    await markDone(supabase, {
      assignmentId,
      planItemId: entry.itemId,
      patientId: userId,
      orgId,
      date: today,
      completed: newCompleted,
    });
  }, [assignmentId, orgId, userId, today]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!assignmentId) {
    return (
      <View style={styles.center}>
        <Text style={styles.notice}>No active care plan assigned.</Text>
      </View>
    );
  }

  const pct = adherencePercent(entries);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle} testID="adherence-pct">
        {pct}% done
      </Text>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.itemId}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.item, item.completed && styles.itemDone]}
            onPress={() => toggle(item)}
            testID={`item-${item.itemId}`}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.detail ? <Text style={styles.itemDetail}>{item.detail}</Text> : null}
            <Text style={styles.itemStatus}>{item.completed ? 'Done' : 'Mark done'}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

// --- Root ---
export default function Index() {
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setChecking(false);
      return;
    }

    getSession().then((session) => {
      setUserId(session?.user.id ?? null);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return <NotConfigured />;
  if (checking) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!userId) return <SignIn />;
  return <TodayScreen userId={userId} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notice: { fontSize: 16, color: '#555', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#2F8F83', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, width: '100%', marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: '#2F8F83', borderRadius: 8, padding: 14, width: '100%', alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: '#B42318', marginTop: 8, textAlign: 'center' },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  itemDone: { backgroundColor: '#f0faf9' },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemDetail: { fontSize: 14, color: '#666', marginTop: 2 },
  itemStatus: { fontSize: 13, color: '#2F8F83', marginTop: 4 },
});
