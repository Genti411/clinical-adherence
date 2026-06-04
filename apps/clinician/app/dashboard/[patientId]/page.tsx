import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { listPatients, getAdherenceLogs } from '@/lib/data';
import { adherenceStats } from '@/lib/dashboard';
import PatientLogTable from './PatientLogTable';

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDashboardPage({ params }: Props) {
  const { patientId } = await params;

  if (!isSupabaseConfigured) {
    return (
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Patient Details</h1>
        <p style={{ marginTop: '1rem', color: '#888' }}>
          Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to connect to your backend.
        </p>
      </main>
    );
  }

  const client = await createClient();
  if (!client) {
    return (
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Patient Details</h1>
        <p style={{ marginTop: '1rem', color: '#888' }}>Unable to connect to backend.</p>
      </main>
    );
  }

  const { data: userData } = await client.auth.getUser();
  const orgId = (userData?.user?.user_metadata?.org_id as string) ?? '';

  const [patients, allLogs] = await Promise.all([
    listPatients(client, orgId),
    getAdherenceLogs(client, orgId),
  ]);

  type RawLog = { patient_id: unknown; plan_item_id: unknown; date: unknown; completed: unknown };

  const patient = patients.find((p) => p.id === patientId);
  const patientLogs = (allLogs as RawLog[])
    .filter((l: RawLog) => (l.patient_id as string) === patientId)
    .map((l: RawLog) => ({
      plan_item_id: l.plan_item_id as string,
      date: l.date as string,
      completed: l.completed as boolean,
    }));

  const today = new Date().toISOString().slice(0, 10);
  const stats = adherenceStats(patientLogs, today);

  const name = patient?.full_name ?? patient?.email ?? patientId;

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: '#0070f3', fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      <h1 style={{ marginTop: '0.75rem' }}>{name}</h1>

      <section style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
        <div>
          <strong>Adherence</strong>
          <div style={{ fontSize: '1.5rem' }}>{stats.pct}%</div>
        </div>
        <div>
          <strong>Last active</strong>
          <div>{stats.lastActive ?? '—'}</div>
        </div>
        <div>
          <strong>Status</strong>
          <div>
            {stats.flagged ? (
              <span style={{ color: '#b91c1c', fontWeight: 600 }}>Needs attention</span>
            ) : (
              <span style={{ color: '#15803d' }}>On track</span>
            )}
          </div>
        </div>
      </section>

      <PatientLogTable logs={patientLogs} patientName={name} />
    </main>
  );
}
