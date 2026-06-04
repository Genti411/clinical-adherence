import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock supabase module - not configured so we can control state
jest.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn(),
  },
}));

// Mock care data layer
jest.mock('../src/lib/care', () => ({
  getActiveAssignment: jest.fn(),
  getPlanItems: jest.fn(),
  getTodayLogs: jest.fn(),
  markDone: jest.fn(),
}));

// Mock auth
jest.mock('../src/lib/auth', () => ({
  getSession: jest.fn().mockResolvedValue({ user: { id: 'user-1' } }),
  sendCode: jest.fn(),
  verifyCode: jest.fn(),
  signOut: jest.fn(),
}));

import { getActiveAssignment, getPlanItems, getTodayLogs, markDone } from '../src/lib/care';

const mockAssignment = { id: 'assign-1', care_plan_id: 'plan-1', org_id: 'org-1' };
const mockItems = [
  { id: 'item-1', type: 'exercise', exercise_id: 'Chin Tucks', target: {}, position: 1 },
  { id: 'item-2', type: 'walking', exercise_id: null, target: { stepsPerDay: 5000 }, position: 2 },
];
const mockLogs = [{ plan_item_id: 'item-1', completed: true }];

describe('Today screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getActiveAssignment as jest.Mock).mockResolvedValue(mockAssignment);
    (getPlanItems as jest.Mock).mockResolvedValue(mockItems);
    (getTodayLogs as jest.Mock).mockResolvedValue(mockLogs);
    (markDone as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('renders item titles', async () => {
    const Index = require('../src/app/index').default;
    const { getByText } = render(<Index />);
    await waitFor(() => {
      expect(getByText('Chin Tucks')).toBeTruthy();
      expect(getByText('Walking')).toBeTruthy();
    });
  });

  it('shows adherence percent', async () => {
    const Index = require('../src/app/index').default;
    const { getByTestId } = render(<Index />);
    await waitFor(() => {
      // 1 of 2 items done = 50%
      const el = getByTestId('adherence-pct');
      const text = Array.isArray(el.props.children)
        ? el.props.children.join('')
        : el.props.children;
      expect(text).toBe('50% done');
    });
  });

  it('toggling an incomplete item calls markDone with completed=true', async () => {
    const Index = require('../src/app/index').default;
    const { getByTestId } = render(<Index />);
    await waitFor(() => {
      expect(getByTestId('item-item-2')).toBeTruthy();
    });
    fireEvent.press(getByTestId('item-item-2'));
    await waitFor(() => {
      expect(markDone).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ planItemId: 'item-2', completed: true }),
      );
    });
  });

  it('toggling a done item calls markDone with completed=false', async () => {
    const Index = require('../src/app/index').default;
    const { getByTestId } = render(<Index />);
    await waitFor(() => {
      expect(getByTestId('item-item-1')).toBeTruthy();
    });
    fireEvent.press(getByTestId('item-item-1'));
    await waitFor(() => {
      expect(markDone).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ planItemId: 'item-1', completed: false }),
      );
    });
  });
});
