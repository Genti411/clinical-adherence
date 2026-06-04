import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {},
}));

jest.mock('../src/lib/auth', () => ({
  getSession: jest.fn().mockResolvedValue({
    user: { id: 'patient-1', user_metadata: { org_id: 'org-1' } },
  }),
}));

jest.mock('../src/lib/care', () => ({
  exportMyData: jest.fn().mockResolvedValue({
    assignments: [{ id: 'a1' }],
    adherence: [],
    outcomes: [],
  }),
  requestDeletion: jest.fn().mockResolvedValue({ ok: true }),
}));

import { exportMyData, requestDeletion } from '../src/lib/care';
import PrivacyScreen from '../src/app/privacy';

describe('PrivacyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (exportMyData as jest.Mock).mockResolvedValue({
      assignments: [{ id: 'a1' }],
      adherence: [],
      outcomes: [],
    });
    (requestDeletion as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('renders export and deletion buttons', () => {
    const { getByTestId } = render(<PrivacyScreen />);
    expect(getByTestId('export-data-btn')).toBeTruthy();
    expect(getByTestId('request-deletion-btn')).toBeTruthy();
  });

  it('calls exportMyData and renders the JSON result', async () => {
    const { getByTestId } = render(<PrivacyScreen />);
    fireEvent.press(getByTestId('export-data-btn'));
    await waitFor(() => {
      expect(getByTestId('export-result')).toBeTruthy();
    });
    expect(exportMyData).toHaveBeenCalledWith(expect.anything(), 'patient-1');
  });

  it('calls requestDeletion and shows confirmation', async () => {
    const { getByTestId } = render(<PrivacyScreen />);
    fireEvent.press(getByTestId('request-deletion-btn'));
    await waitFor(() => {
      expect(getByTestId('deletion-requested-msg')).toBeTruthy();
    });
    expect(requestDeletion).toHaveBeenCalledWith(
      expect.anything(),
      { patientId: 'patient-1', orgId: 'org-1' },
    );
  });

  it('shows not-configured notice when supabase is unconfigured', () => {
    const mod = jest.requireMock('../src/lib/supabase');
    const orig = mod.isSupabaseConfigured;
    mod.isSupabaseConfigured = false;
    try {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText(/supabase is not configured/i)).toBeTruthy();
    } finally {
      mod.isSupabaseConfigured = orig;
    }
  });
});
