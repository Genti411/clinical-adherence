// These tests run with NO Supabase env vars, so supabase is null.
// Module isolation is achieved via jest.isolateModules.
describe('auth (no supabase configured)', () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('getSession returns null when not configured', async () => {
    let getSession: () => Promise<unknown>;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const auth = require('../src/lib/auth');
      getSession = auth.getSession;
    });
    const session = await getSession!();
    expect(session).toBeNull();
  });

  it('sendCode reports not-configured when env unset', async () => {
    let sendCode: (email: string) => Promise<{ ok: boolean; error?: string }>;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const auth = require('../src/lib/auth');
      sendCode = auth.sendCode;
    });
    const result = await sendCode!('test@example.com');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not configured/i);
    }
  });
});
