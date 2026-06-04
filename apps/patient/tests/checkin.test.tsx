import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Guard: configured
jest.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {},
}));

// Mock auth - return a session with userId and orgId
jest.mock('../src/lib/auth', () => ({
  getSession: jest.fn().mockResolvedValue({
    user: { id: 'user-1', user_metadata: { org_id: 'org-1' } },
  }),
}));

// Mock care data layer
jest.mock('../src/lib/care', () => ({
  saveOutcome: jest.fn().mockResolvedValue({ ok: true }),
}));

import { saveOutcome } from '../src/lib/care';
import CheckInScreen from '../src/app/checkin';

describe('CheckInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (saveOutcome as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('renders all DAILY_FUNCTION questions', () => {
    const { getByTestId } = render(<CheckInScreen />);
    expect(getByTestId('question-pain')).toBeTruthy();
    expect(getByTestId('question-stiffness')).toBeTruthy();
    expect(getByTestId('question-function')).toBeTruthy();
  });

  it('shows validation errors when submitted without answers', async () => {
    const { getByTestId } = render(<CheckInScreen />);
    fireEvent.press(getByTestId('submit-checkin-btn'));
    await waitFor(() => {
      expect(getByTestId('error-0')).toBeTruthy();
    });
  });

  it('shows score after submitting valid answers', async () => {
    const { getByTestId } = render(<CheckInScreen />);

    // Best answers: pain=0, stiffness=0, function=10 -> score 100
    fireEvent.changeText(getByTestId('input-pain'), '0');
    fireEvent.changeText(getByTestId('input-stiffness'), '0');
    fireEvent.changeText(getByTestId('input-function'), '10');
    fireEvent.press(getByTestId('submit-checkin-btn'));

    await waitFor(() => {
      expect(getByTestId('score-display')).toBeTruthy();
    });

    const scoreEl = getByTestId('score-display');
    const text = Array.isArray(scoreEl.props.children)
      ? scoreEl.props.children.join('')
      : scoreEl.props.children;
    expect(text).toContain('100');
  });

  it('calls saveOutcome with correct params on submit', async () => {
    const { getByTestId } = render(<CheckInScreen />);

    fireEvent.changeText(getByTestId('input-pain'), '0');
    fireEvent.changeText(getByTestId('input-stiffness'), '0');
    fireEvent.changeText(getByTestId('input-function'), '10');
    fireEvent.press(getByTestId('submit-checkin-btn'));

    await waitFor(() => {
      expect(saveOutcome).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          patientId: 'user-1',
          orgId: 'org-1',
          instrument: 'daily-function-v1',
          score: 100,
        }),
      );
    });
  });

  it('shows not-configured notice when supabase is unconfigured', () => {
    // Temporarily flip the isSupabaseConfigured flag via the module mock
    const supabaseMock = jest.requireMock('../src/lib/supabase');
    const orig = supabaseMock.isSupabaseConfigured;
    supabaseMock.isSupabaseConfigured = false;
    try {
      const { getByText } = render(<CheckInScreen />);
      expect(getByText(/supabase is not configured/i)).toBeTruthy();
    } finally {
      supabaseMock.isSupabaseConfigured = orig;
    }
  });
});
