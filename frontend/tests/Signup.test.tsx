// tests/Signup.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { SignupForm } from '../src/components/auth/AuthForms';

const mockSignup = vi.fn();
const mockNavigate = vi.fn();

// Mock useAuth
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    signup: mockSignup,
  }),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders required inputs', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('blocks weak password', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@x.com');
    await user.type(screen.getByLabelText(/^password$/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'short');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password does not meet/i)).toBeInTheDocument();
    });
  });

  it('signs up successfully', async () => {
    mockSignup.mockResolvedValueOnce(undefined);

    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'new@user.com');
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('new@user.com', 'StrongPass1!');
      expect(mockNavigate).toHaveBeenCalledWith('/studio');
    });
  });

  it('shows error message on API failure', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Signup failed'));

    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'bad@user.com');
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/signup failed/i)).toBeInTheDocument();
    });
  });
});
