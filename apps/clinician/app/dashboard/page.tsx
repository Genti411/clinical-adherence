import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { listPatients, getAdherenceLogs } from '@/lib/data';
import { adherenceStats } from '@/lib/dashboard';

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Patient Dashboard</h1>
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
        <h1>Patient Dashboard</h1>
        <p style={{ marginTop: '1rem', color: '#888' }}>Unable to connect to backend.</p>
      </main>
    );
  }

  const { data: userData } = await client.auth.getUser();
  const orgId = (userData?.user?.user_metadata?.org_id as string) ?? '';

  const [patients, logs] = await Promise.all([
    listPatients(client, orgId),
    getAdherenceLogs(client, orgId),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  type RawLog = { patient_id: unknown; plan_item_id: unknown; date: unknown; completed: unknown };

  // Group logs by patient_id
  const logsByPatient: Record<string, RawLog[]> = {};
  for (const log of logs as RawLog[]) {
    const pid = log.patient_id as string;
    if (!logsByPatient[pid]) logsByPatient[pid] = [];
    logsByPatient[pid].push(log);
  }

  type PatientRow = {
    id: string;
    name: string;
    pct: number;
    lastActive: string | null;
    flagged: boolean;
  };

  const rows: PatientRow[] = patients.map((p) => {
    const patientLogs = (logsByPatient[p.id] ?? []).map((l: RawLog) => ({
      plan_item_id: l.plan_item_id as string,
      date: l.date as string,
      completed: l.completed as boolean,
    }));
    const stats = adherenceStats(patientLogs, today);
    return {
      id: p.id,
      name: p.full_name ?? p.email ?? p.id,
      pct: stats.pct,
      lastActive: stats.lastActive,
      flagged: stats.flagged,
    };
  });

  // Sort: flagged first
  rows.sort((a, b) => Number(b.flagged) - Number(a.flagged));

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Patient Dashboard</h1>
        <Link href="/" style={{ color: '#0070f3' }}>Care Plans</Link>
      </div>

      {rows.length === 0 ? (
        <p style={{ marginTop: '1.5rem', color: '#888' }}>No patients found in your organisation.</p>
      ) : (
        <table style={{ marginTop: '1.5rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem' }}>Patient</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Adherence</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Last Active</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                <td style={{ padding: '0.5rem 0.75rem' }}>{row.name}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{row.pct}%</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{row.lastActive ?? '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  {row.flagged && (
                    <span
                      data-testid="needs-attention-badge"
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      Needs attention
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <Link href={`/dashboard/${row.id}`} style={{ color: '#0070f3', fontSize: '0.875rem' }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
