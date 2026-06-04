/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Must be declared before importing the component

jest.mock('@/lib/supabase/config', () => ({
  isSupabaseConfigured: true,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Data layer mocks
jest.mock('@/lib/data', () => ({
  listPatients: jest.fn(),
  getAdherenceLogs: jest.fn(),
}));

// dashboard stats -- use real implementation
// (no mock needed; it's pure)

import { cleanup } from '@testing-library/react';
import { createClient } from '@/lib/supabase/server';
import { listPatients, getAdherenceLogs } from '@/lib/data';
import DashboardPage from './page';

const mockCreateClient = createClient as jest.Mock;
const mockListPatients = listPatients as jest.Mock;
const mockGetAdherenceLogs = getAdherenceLogs as jest.Mock;

function makeClient() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'u1', user_metadata: { org_id: 'org-1' } } },
      }),
    },
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(makeClient());
  });

  afterEach(() => {
    cleanup();
  });

  it('shows "Needs attention" badge for flagged patient and none for healthy patient', async () => {
    const today = new Date().toISOString().slice(0, 10);

    mockListPatients.mockResolvedValue([
      { id: 'p1', full_name: 'Alice Flagged', email: null },
      { id: 'p2', full_name: 'Bob Healthy', email: null },
    ]);

    // Alice: no logs -> flagged
    // Bob: completed log today -> pct 100, not flagged
    mockGetAdherenceLogs.mockResolvedValue([
      { assignment_id: 'a1', plan_item_id: 'pi1', patient_id: 'p2', date: today, completed: true },
    ]);

    const ui = await DashboardPage();
    render(ui);

    expect(screen.getByText('Alice Flagged')).toBeInTheDocument();
    expect(screen.getByText('Bob Healthy')).toBeInTheDocument();

    const badges = screen.getAllByTestId('needs-attention-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('Needs attention');
  });

  it('sorts flagged patients first', async () => {
    const today = new Date().toISOString().slice(0, 10);

    mockListPatients.mockResolvedValue([
      { id: 'p1', full_name: 'Bob Healthy', email: null },
      { id: 'p2', full_name: 'Alice Flagged', email: null },
    ]);

    mockGetAdherenceLogs.mockResolvedValue([
      { assignment_id: 'a1', plan_item_id: 'pi1', patient_id: 'p1', date: today, completed: true },
    ]);

    const ui = await DashboardPage();
    render(ui);

    const rows = screen.getAllByRole('row');
    // rows[0] = header, rows[1] = first data row (should be Alice - flagged)
    expect(rows[1]).toHaveTextContent('Alice Flagged');
    expect(rows[2]).toHaveTextContent('Bob Healthy');
  });

  it('shows notice when unconfigured', async () => {
    const configMock = jest.requireMock('@/lib/supabase/config');
    configMock.isSupabaseConfigured = false;

    try {
      const ui = await DashboardPage();
      render(ui);
      expect(screen.getByText(/supabase is not configured/i)).toBeInTheDocument();
    } finally {
      configMock.isSupabaseConfigured = true;
    }
  });
});
