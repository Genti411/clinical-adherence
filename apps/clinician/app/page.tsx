import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  if (!isSupabaseConfigured) {
    return (
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Clinician Portal</h1>
        <p style={{ marginTop: '1rem', color: '#888' }}>
          Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to connect to your backend.
        </p>
      </main>
    );
  }

  const client = await createClient();

  let plans: { id: string; title: string; status: string; created_at: string }[] = [];

  if (client) {
    const { data } = await client
      .from('care_plans')
      .select('id,title,status,created_at')
      .order('created_at', { ascending: false });
    plans = data ?? [];
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Care Plans</h1>
        <Link href="/plans/new" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', borderRadius: '4px' }}>
          New care plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <p style={{ marginTop: '1.5rem', color: '#888' }}>No care plans yet. Create your first one.</p>
      ) : (
        <ul style={{ marginTop: '1.5rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {plans.map(plan => (
            <li key={plan.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '6px' }}>
              <strong>{plan.title}</strong>
              <span style={{ marginLeft: '1rem', color: '#888', fontSize: '0.875rem' }}>{plan.status}</span>
              <span style={{ marginLeft: '1rem', color: '#888', fontSize: '0.875rem' }}>
                {new Date(plan.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
