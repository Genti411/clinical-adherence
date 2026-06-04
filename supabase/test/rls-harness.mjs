import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import pg from 'pg';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const CONTAINER = 'ca-pg';
const PORT = 55432;
const APP_URL = `postgresql://app:pw@localhost:${PORT}/postgres`;

// Fixed UUIDs matching seed.sql
const IDS = {
  ORG_A:       'aaaaaaaa-0000-0000-0000-000000000001',
  ORG_B:       'bbbbbbbb-0000-0000-0000-000000000001',
  ADMIN_A:     'aaaaaaaa-0000-0000-0000-000000000010',
  CLINICIAN_A: 'aaaaaaaa-0000-0000-0000-000000000020',
  PATIENT_P1:  'aaaaaaaa-0000-0000-0000-000000000030',
  PATIENT_P2:  'bbbbbbbb-0000-0000-0000-000000000030',
};

function log(msg) { console.log(msg); }
function pass(name) { log(`  PASS  ${name}`); }
function fail(name, detail) { log(`  FAIL  ${name}: ${detail}`); process.exitCode = 1; }

// Run psql inside the container (handles multi-statement SQL, dollar-quotes, etc.)
function psql(sql) {
  const res = spawnSync('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', 'postgres', '-c', sql,
  ], { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(`psql failed: ${res.stderr || res.stdout}`);
  }
  return res.stdout;
}

// Run a SQL file via psql stdin inside the container
function psqlFile(hostPath) {
  const res = spawnSync('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', 'postgres',
  ], {
    encoding: 'utf8',
    input: require('fs').readFileSync(hostPath, 'utf8'),
  });
  if (res.status !== 0) {
    throw new Error(`psqlFile ${hostPath} failed: ${res.stderr || res.stdout}`);
  }
  return res.stdout;
}

// Use dynamic import for fs (works in ESM)
import { readFileSync, readdirSync } from 'fs';

function psqlSql(sql) {
  const res = spawnSync('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', 'postgres',
  ], {
    encoding: 'utf8',
    input: sql,
  });
  if (res.status !== 0) {
    throw new Error(`psql failed:\nSTDOUT: ${res.stdout}\nSTDERR: ${res.stderr}`);
  }
  return res.stdout;
}

async function waitReady(retries = 30, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    const r = spawnSync('docker', [
      'exec', CONTAINER,
      'pg_isready', '-U', 'postgres',
    ], { encoding: 'utf8' });
    if (r.status === 0) return;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error('Postgres did not become ready in time');
}

async function asUser(userId, queryText, params = []) {
  const c = new Client({ connectionString: APP_URL });
  await c.connect();
  try {
    // Set the JWT claims so auth.uid() returns the user's UUID
    await c.query(`set request.jwt.claims = '{"sub":"${userId}"}'`);
    const res = await c.query(queryText, params);
    return res;
  } finally {
    await c.end();
  }
}

async function main() {
  // Always remove any leftover container first
  spawnSync('docker', ['rm', '-f', CONTAINER], { stdio: 'ignore' });

  log('Starting Postgres container...');
  const run = spawnSync('docker', [
    'run', '-d', '--name', CONTAINER,
    '-e', 'POSTGRES_PASSWORD=pw',
    '-p', `${PORT}:5432`,
    'postgres:16',
  ], { encoding: 'utf8' });

  if (run.status !== 0) {
    throw new Error(`docker run failed:\n${run.stderr}`);
  }

  try {
    log('Waiting for Postgres to be ready...');
    await waitReady();
    log('Postgres ready.');

    const shimPath   = resolve(__dirname, '00_local_auth_shim.sql');
    const migrationsDir = resolve(__dirname, '../migrations');
    const seedPath   = resolve(__dirname, '../seed.sql');

    log('Applying auth shim...');
    psqlSql(readFileSync(shimPath, 'utf8'));

    log('Applying migrations in order...');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    for (const mf of migrationFiles) {
      log(`  Applying ${mf}...`);
      psqlSql(readFileSync(resolve(migrationsDir, mf), 'utf8'));
    }

    log('Applying seed...');
    psqlSql(readFileSync(seedPath, 'utf8'));

    // Create non-owner app role
    log('Creating app role...');
    psqlSql(`
      do $$ begin
        if not exists (select 1 from pg_roles where rolname = 'app') then
          create role app login password 'pw';
        end if;
      end $$;
      grant usage on schema public to app;
      grant usage on schema auth to app;
      grant select, insert, update, delete on all tables in schema public to app;
      grant select on auth.users to app;
      grant execute on all functions in schema public to app;
      grant execute on all functions in schema auth to app;
    `);

    log('\nRunning RLS assertions...');
    let passed = 0;
    let failed = 0;

    // 1. Patient P1 selecting own adherence_logs -> rows > 0
    try {
      const r = await asUser(IDS.PATIENT_P1, 'select * from public.adherence_logs');
      if (r.rows.length > 0) { pass('P1 sees own adherence_logs'); passed++; }
      else { fail('P1 sees own adherence_logs', `got ${r.rows.length} rows`); failed++; }
    } catch(e) { fail('P1 sees own adherence_logs', e.message); failed++; }

    // 2. Patient P1 selecting P2's adherence (different patient/org) -> 0 rows
    try {
      const r = await asUser(IDS.PATIENT_P1, `select * from public.adherence_logs where patient_id = $1`, [IDS.PATIENT_P2]);
      if (r.rows.length === 0) { pass("P1 cannot see P2's adherence_logs"); passed++; }
      else { fail("P1 cannot see P2's adherence_logs", `got ${r.rows.length} rows`); failed++; }
    } catch(e) { fail("P1 cannot see P2's adherence_logs", e.message); failed++; }

    // 3. Patient P1 selecting care_plans -> 0 rows (no policy for patients)
    try {
      const r = await asUser(IDS.PATIENT_P1, 'select * from public.care_plans');
      if (r.rows.length === 0) { pass('P1 cannot see care_plans'); passed++; }
      else { fail('P1 cannot see care_plans', `got ${r.rows.length} rows`); failed++; }
    } catch(e) { fail('P1 cannot see care_plans', e.message); failed++; }

    // 4. Clinician C1 (Org A) selecting adherence_logs for Org A -> rows > 0
    try {
      const r = await asUser(IDS.CLINICIAN_A, 'select * from public.adherence_logs');
      if (r.rows.length > 0) { pass('Clinician A sees Org A adherence_logs'); passed++; }
      else { fail('Clinician A sees Org A adherence_logs', `got ${r.rows.length} rows`); failed++; }
    } catch(e) { fail('Clinician A sees Org A adherence_logs', e.message); failed++; }

    // 5. Clinician C1 (Org A) selecting Org B care_plans -> 0 rows
    try {
      const r = await asUser(IDS.CLINICIAN_A, `select * from public.care_plans where org_id = $1`, [IDS.ORG_B]);
      if (r.rows.length === 0) { pass('Clinician A cannot see Org B care_plans'); passed++; }
      else { fail('Clinician A cannot see Org B care_plans', `got ${r.rows.length} rows`); failed++; }
    } catch(e) { fail('Clinician A cannot see Org B care_plans', e.message); failed++; }

    // 6. UPDATE audit_logs as admin -> blocked (no update policy; RLS silently returns 0 rows)
    try {
      const updateRes = await asUser(IDS.ADMIN_A, `update public.audit_logs set action = 'tampered' where org_id = $1 returning id`, [IDS.ORG_A]);
      if (updateRes.rows.length === 0) { pass('Admin cannot UPDATE audit_logs (RLS blocks silently)'); passed++; }
      else { fail('Admin cannot UPDATE audit_logs', 'rows were modified'); failed++; }
    } catch(e) {
      // Also fine: Postgres may throw permission error
      pass(`Admin cannot UPDATE audit_logs (threw: ${e.message.slice(0, 60)})`);
      passed++;
    }

    // 7. Admin selecting audit_logs in own org -> allowed (rows > 0)
    try {
      const r = await asUser(IDS.ADMIN_A, 'select * from public.audit_logs');
      if (r.rows.length > 0) { pass('Admin sees own org audit_logs'); passed++; }
      else { fail('Admin sees own org audit_logs', `got ${r.rows.length} rows`); failed++; }
    } catch(e) { fail('Admin sees own org audit_logs', e.message); failed++; }

    log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exitCode = 1;

  } finally {
    log('\nTearing down container...');
    spawnSync('docker', ['rm', '-f', CONTAINER], { stdio: 'inherit' });
    log('Container removed.');
  }
}

main().catch(err => {
  console.error('Harness error:', err);
  spawnSync('docker', ['rm', '-f', CONTAINER], { stdio: 'ignore' });
  process.exit(1);
});
