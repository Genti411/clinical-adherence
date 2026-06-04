'use client';

import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isSupabaseConfigured) {
    return (
      <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Clinician Sign In</h1>
        <p style={{ marginTop: '1rem', color: '#888' }}>
          Cloud not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables to enable authentication.
        </p>
      </main>
    );
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    const client = createClient();
    if (!client) return;
    const { error: signInError } = await client.auth.signInWithOtp({ email });
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage('Check your email for a sign-in code.');
      setStep('verify');
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    const client = createClient();
    if (!client) return;
    const { error: verifyError } = await client.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (verifyError) {
      setError(verifyError.message);
    } else {
      window.location.href = '/';
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Clinician Sign In</h1>

      {step === 'email' && (
        <form onSubmit={sendCode} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>Send code</button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={verifyCode} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>Enter the code sent to <strong>{email}</strong>.</p>
          <label htmlFor="token">One-time code</label>
          <input
            id="token"
            type="text"
            required
            value={token}
            onChange={e => setToken(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>Verify</button>
          <button type="button" onClick={() => setStep('email')} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid #ccc' }}>
            Back
          </button>
        </form>
      )}

      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
      {error && <p style={{ marginTop: '1rem', color: 'red' }}>{error}</p>}
    </main>
  );
}
