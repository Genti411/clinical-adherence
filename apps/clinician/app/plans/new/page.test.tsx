/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---- Mocks must be declared before importing the component ----

// Mock Supabase config: pretend it is configured so the page renders the builder
jest.mock('@/lib/supabase/config', () => ({
  isSupabaseConfigured: true,
}));

// Mock browser client - not used in these tests (we test UI only)
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1', user_metadata: { org_id: 'o1' } } } }),
    },
  })),
}));

// Mock data layer
const mockCreateCarePlan = jest.fn().mockResolvedValue({ id: 'plan-abc' });
const mockListPatients = jest.fn().mockResolvedValue([]);
const mockAssignPlan = jest.fn().mockResolvedValue({ id: 'assign-1' });

jest.mock('@/lib/data', () => ({
  createCarePlan: (...args: unknown[]) => mockCreateCarePlan(...args),
  listPatients: (...args: unknown[]) => mockListPatients(...args),
  assignPlan: (...args: unknown[]) => mockAssignPlan(...args),
}));

// Import after mocks
import NewCarePlanPage from './page';

describe('NewCarePlanPage builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateCarePlan.mockResolvedValue({ id: 'plan-abc' });
    mockListPatients.mockResolvedValue([]);
  });

  it('renders title input and exercise search', () => {
    render(<NewCarePlanPage />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search exercises/i)).toBeInTheDocument();
  });

  it('shows exercises from the library', () => {
    render(<NewCarePlanPage />);
    // Chin Tucks is in the dataset
    expect(screen.getByText('Chin Tucks')).toBeInTheDocument();
  });

  it('adds an exercise item and shows it in the list', async () => {
    render(<NewCarePlanPage />);
    // Initially no items
    expect(screen.getByText('No items added yet.')).toBeInTheDocument();

    // Click add on Chin Tucks
    const addBtn = screen.getByRole('button', { name: /add chin tucks/i });
    await act(async () => { fireEvent.click(addBtn); });

    // "No items added yet." is gone
    expect(screen.queryByText('No items added yet.')).not.toBeInTheDocument();
    // Remove button for item 1 is present (item was added to plan items list)
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
  });

  it('shows validation error when saving with empty title', async () => {
    render(<NewCarePlanPage />);

    // Add an exercise so "no items" error doesn't dominate
    const addBtn = screen.getByRole('button', { name: /add chin tucks/i });
    await act(async () => { fireEvent.click(addBtn); });

    // Try to save without a title - validation errors should be live
    // Title is empty, so "Title is required." should be visible
    expect(screen.getByText('Title is required.')).toBeInTheDocument();

    // The save button should be disabled (errors present)
    const saveBtn = screen.getByRole('button', { name: /save plan/i });
    expect(saveBtn).toBeDisabled();
  });

  it('removes an item when Remove is clicked', async () => {
    render(<NewCarePlanPage />);

    const addBtn = screen.getByRole('button', { name: /add chin tucks/i });
    await act(async () => { fireEvent.click(addBtn); });

    expect(screen.queryByText('No items added yet.')).not.toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /remove item 1/i });
    await act(async () => { fireEvent.click(removeBtn); });

    expect(screen.getByText('No items added yet.')).toBeInTheDocument();
  });

  it('filters exercises by search term', async () => {
    render(<NewCarePlanPage />);
    const search = screen.getByPlaceholderText(/search exercises/i);
    await act(async () => { fireEvent.change(search, { target: { value: 'Chin' } }); });

    expect(screen.getByText('Chin Tucks')).toBeInTheDocument();
    // A non-neck exercise shouldn't appear
    expect(screen.queryByText('Calf Raises')).not.toBeInTheDocument();
  });
});
