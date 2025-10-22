import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../RegisterForm';

// Mock fetch for legacy email checking
global.fetch = jest.fn();

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnLegacyDataDetected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Form rendering', () => {
    it('should render registration form with all fields', () => {
      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    });

    it('should have link to login page', () => {
      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      const loginLink = screen.getByRole('link', { name: 'Log in' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Form validation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm password'), 'password456');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), '12345');
      await user.type(screen.getByLabelText('Confirm password'), '12345');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm password'), 'password123');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'Test User'
        );
      });
    });
  });

  describe('Legacy data detection (migration)', () => {
    it('should check for legacy email on blur', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          hasLegacyData: true,
          gameCount: 5,
          leaderboardEntry: null,
        }),
      });

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          onLegacyDataDetected={mockOnLegacyDataDetected}
        />
      );

      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'legacy@example.com');

      // Blur the email field to trigger legacy check
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/check-legacy-email',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'legacy@example.com' }),
          })
        );
      });

      expect(mockOnLegacyDataDetected).toHaveBeenCalledWith({
        hasLegacyData: true,
        gameCount: 5,
        leaderboardEntry: null,
      });
    });

    it('should NOT display "Welcome back!" message even with legacy data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          hasLegacyData: true,
          gameCount: 5,
          leaderboardEntry: null,
        }),
      });

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          onLegacyDataDetected={mockOnLegacyDataDetected}
        />
      );

      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'legacy@example.com');
      fireEvent.blur(emailInput);

      // Wait for API call to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Verify that the "Welcome back!" message does NOT appear
      expect(screen.queryByText(/Welcome back!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/previous game/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/automatically linked/i)).not.toBeInTheDocument();
    });

    it('should NOT display migration UI for users with legacy data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          hasLegacyData: true,
          gameCount: 10,
          leaderboardEntry: { score: 8 },
        }),
      });

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'legacy@example.com');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Verify no migration-related UI elements are visible
      const allText = document.body.textContent || '';
      expect(allText).not.toContain('Welcome back');
      expect(allText).not.toContain('10 previous game');
      expect(allText).not.toContain('automatically linked');
    });

    it('should handle legacy check error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should not show any error to user
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to check legacy email',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not check legacy data for invalid emails', async () => {
      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      const emailInput = screen.getByLabelText('Email');

      // Type incomplete email
      await userEvent.type(emailInput, 'notanemail');
      fireEvent.blur(emailInput);

      // Should not make API call for invalid email
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should disable form fields when loading', () => {
      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      expect(screen.getByLabelText('Name')).toBeDisabled();
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
      expect(screen.getByLabelText('Confirm password')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      expect(screen.getByRole('button', { name: 'Creating account...' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should display error from onSubmit', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Email already exists'));

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm password'), 'password123');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('should clear error when submitting again', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValueOnce(new Error('Email already exists'));

      render(
        <RegisterForm
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm password'), 'password123');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      // Fix the error and resubmit
      mockOnSubmit.mockResolvedValue(undefined);
      await user.clear(screen.getByLabelText('Email'));
      await user.type(screen.getByLabelText('Email'), 'newemail@example.com');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
      });
    });
  });
});
