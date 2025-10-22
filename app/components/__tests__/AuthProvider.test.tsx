import { render, screen, waitFor, act } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../AuthProvider';
import { supabase } from '@/lib/supabaseClient';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Test component that uses auth
function TestComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in: ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

describe('AuthProvider', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
  };

  const mockSession = {
    user: mockUser,
    access_token: 'mock-token',
  };

  let mockUnsubscribe: jest.Mock;
  let mockOnAuthStateChange: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUnsubscribe = jest.fn();
    mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));

    (supabase.auth.onAuthStateChange as jest.Mock) = mockOnAuthStateChange;
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  describe('Initial session loading', () => {
    it('should show loading state initially', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should load user session on mount', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Logged in: test@example.com'
        );
      });

      // Called twice: once on mount, once for pathname effect
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should show not logged in when no session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Not logged in'
        );
      });
    });
  });

  describe('Auth state change listener', () => {
    it('should subscribe to auth state changes on mount', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });
    });

    it('should update user when auth state changes', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Not logged in'
        );
      });

      // Simulate auth state change (user logs in)
      const authStateChangeCallback = mockOnAuthStateChange.mock.calls[0][0];
      act(() => {
        authStateChangeCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Logged in: test@example.com'
        );
      });
    });

    it('should unsubscribe on unmount', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Route change session refresh (navbar fix)', () => {
    it('should re-check session when pathname changes', async () => {
      // Initial mount with no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });
      (usePathname as jest.Mock).mockReturnValue('/');

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Not logged in'
        );
      });

      // Clear mock calls to track new ones
      jest.clearAllMocks();

      // Simulate login happening on server + redirect to /game
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (usePathname as jest.Mock).mockReturnValue('/game');

      // Re-render with new pathname
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should re-check session due to pathname change
      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Logged in: test@example.com'
        );
      });
    });

    it('should sync navbar state after login redirect', async () => {
      // Start at login page, no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });
      (usePathname as jest.Mock).mockReturnValue('/login');

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Not logged in'
        );
      });

      // Login completes, redirect to /game with session cookie set
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (usePathname as jest.Mock).mockReturnValue('/game');

      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Navbar should now show logged in state
      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Logged in: test@example.com'
        );
      });
    });

    it('should not cause unnecessary re-renders on same pathname', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (usePathname as jest.Mock).mockReturnValue('/game');

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Logged in: test@example.com'
        );
      });

      const initialCallCount = (supabase.auth.getSession as jest.Mock).mock.calls.length;

      // Re-render with same pathname
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should not trigger additional session check
      expect((supabase.auth.getSession as jest.Mock).mock.calls.length).toBe(
        initialCallCount
      );
    });
  });

  describe('Sign out', () => {
    it('should sign out user and update state', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Logged in: test@example.com'
        );
      });

      const signOutButton = screen.getByText('Sign out');
      await act(async () => {
        signOutButton.click();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'Not logged in'
        );
      });
    });
  });
});
