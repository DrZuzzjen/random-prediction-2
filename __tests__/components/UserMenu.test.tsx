/**
 * Tests for UserMenu component
 *
 * These tests verify that:
 * 1. Shows Login/Signup buttons when user is not authenticated
 * 2. Shows user menu with email when user is authenticated
 * 3. Displays logout button when authenticated
 * 4. Click-outside handler closes the dropdown
 * 5. Logout functionality works correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '@/app/components/UserMenu';
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('@/app/components/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('UserMenu', () => {
  const mockPush = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    mockSignOut.mockClear();
    mockPush.mockClear();
  });

  describe('Not authenticated state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signOut: mockSignOut,
      });
    });

    it('should show Login and Sign up buttons when not authenticated', () => {
      render(<UserMenu />);

      expect(screen.getByText('Log in')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('should have correct links for Login and Sign up', () => {
      render(<UserMenu />);

      const loginLink = screen.getByText('Log in').closest('a');
      const signupLink = screen.getByText('Sign up').closest('a');

      expect(loginLink).toHaveAttribute('href', '/login');
      expect(signupLink).toHaveAttribute('href', '/register');
    });

    it('should not show user menu dropdown', () => {
      render(<UserMenu />);

      expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
      expect(screen.queryByText('My Stats')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated state', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'testuser@example.com',
      user_metadata: { name: 'Test User' },
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser as any,
        loading: false,
        signOut: mockSignOut,
      });
    });

    it('should show user email prefix in button when authenticated', () => {
      render(<UserMenu />);

      // Should show email prefix (before @)
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should not show Login/Signup buttons when authenticated', () => {
      render(<UserMenu />);

      expect(screen.queryByText('Log in')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
    });

    it('should show dropdown menu when button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const menuButton = screen.getByRole('button', { name: /testuser/i });
      await user.click(menuButton);

      // Dropdown should be visible
      expect(screen.getByText('Signed in as')).toBeInTheDocument();
      expect(screen.getByText('testuser@example.com')).toBeInTheDocument();
      expect(screen.getByText('🎯 Play Game')).toBeInTheDocument();
      expect(screen.getByText('📊 My Stats')).toBeInTheDocument();
      expect(screen.getByText('📈 Global Analytics')).toBeInTheDocument();
      expect(screen.getByText('🚪 Sign out')).toBeInTheDocument();
    });

    it('should have correct links in dropdown menu', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const menuButton = screen.getByRole('button', { name: /testuser/i });
      await user.click(menuButton);

      const gameLink = screen.getByText('🎯 Play Game').closest('a');
      const statsLink = screen.getByText('📊 My Stats').closest('a');
      const analyticsLink = screen.getByText('📈 Global Analytics').closest('a');

      expect(gameLink).toHaveAttribute('href', '/game');
      expect(statsLink).toHaveAttribute('href', '/my-analytics');
      expect(analyticsLink).toHaveAttribute('href', '/analytics');
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <UserMenu />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open the dropdown
      const menuButton = screen.getByRole('button', { name: /testuser/i });
      await user.click(menuButton);

      expect(screen.getByText('🚪 Sign out')).toBeInTheDocument();

      // Click outside
      const outsideElement = screen.getByTestId('outside');
      await user.click(outsideElement);

      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByText('🚪 Sign out')).not.toBeInTheDocument();
      });
    });

    it('should toggle dropdown when clicking button multiple times', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const menuButton = screen.getByRole('button', { name: /testuser/i });

      // First click - open
      await user.click(menuButton);
      expect(screen.getByText('🚪 Sign out')).toBeInTheDocument();

      // Second click - close
      await user.click(menuButton);
      await waitFor(() => {
        expect(screen.queryByText('🚪 Sign out')).not.toBeInTheDocument();
      });

      // Third click - open again
      await user.click(menuButton);
      expect(screen.getByText('🚪 Sign out')).toBeInTheDocument();
    });

    describe('Logout functionality', () => {
      it('should call signOut and redirect to login when Sign out is clicked', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        // Open dropdown
        const menuButton = screen.getByRole('button', { name: /testuser/i });
        await user.click(menuButton);

        // Click Sign out
        const signOutButton = screen.getByText('🚪 Sign out');
        await user.click(signOutButton);

        // Should call signOut
        expect(mockSignOut).toHaveBeenCalledTimes(1);

        // Should redirect to login
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/login');
        });
      });

      // Note: UserMenu currently doesn't have error handling for signOut failures
      // This is acceptable since signOut is a fire-and-forget operation
      // and failures would be logged by Supabase client
    });

    describe('Email display', () => {
      it('should show full email when no @ symbol present', () => {
        mockUseAuth.mockReturnValue({
          user: { ...mockUser, email: 'invalidemailformat' } as any,
          loading: false,
          signOut: mockSignOut,
        });

        render(<UserMenu />);

        expect(screen.getByText('invalidemailformat')).toBeInTheDocument();
      });

      it('should handle undefined email gracefully', () => {
        mockUseAuth.mockReturnValue({
          user: { ...mockUser, email: undefined } as any,
          loading: false,
          signOut: mockSignOut,
        });

        render(<UserMenu />);

        // Should still render button without crashing
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });
});
