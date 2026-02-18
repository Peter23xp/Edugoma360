import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { useAuthStore } from '../../stores/auth.store';
import { useOfflineStore } from '../../stores/offline.store';

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('../../lib/api', () => ({
    checkServerHealth: vi.fn().mockResolvedValue(true),
    default: {
        post: vi.fn(),
    },
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Helper to render with router
const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuthStore.getState().logout();
        useOfflineStore.getState().setOnline(true);
    });

    it('renders correctly with disabled button initially', () => {
        renderWithRouter(<LoginPage />);

        expect(screen.getByText('EduGoma 360')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email ou Matricule/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();

        const submitButton = screen.getByRole('button', { name: /SE CONNECTER/i });
        expect(submitButton).toBeDisabled();
    });

    it('enables button when fields are filled', async () => {
        renderWithRouter(<LoginPage />);

        const identifierInput = screen.getByLabelText(/Email ou Matricule/i);
        const passwordInput = screen.getByLabelText(/Mot de passe/i);

        fireEvent.change(identifierInput, { target: { value: 'admin@edugoma360.cd' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: /SE CONNECTER/i });
        expect(submitButton).not.toBeDisabled();
    });

    it('shows loading state during submission', async () => {
        useAuthStore.setState({ isLoading: true });
        renderWithRouter(<LoginPage />);

        const submitButton = screen.getByRole('button', { name: /Connexion en cours/i });
        expect(submitButton).toBeDisabled();
        expect(screen.getByLabelText(/Email ou Matricule/i)).toBeDisabled();
    });

    it('displays error message on invalid credentials', async () => {
        const loginMock = vi.fn().mockRejectedValue({
            response: { status: 401, data: { error: { message: 'Identifiants invalides' } } }
        });

        // Mock the store login function
        useAuthStore.setState({ login: loginMock });

        renderWithRouter(<LoginPage />);

        const identifierInput = screen.getByLabelText(/Email ou Matricule/i);
        const passwordInput = screen.getByLabelText(/Mot de passe/i);
        const submitButton = screen.getByRole('button', { name: /SE CONNECTER/i });

        fireEvent.change(identifierInput, { target: { value: 'wrong@user.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Email\/matricule ou mot de passe incorrect/i)).toBeInTheDocument();
        });
    });

    it('shows offline banner when offline', () => {
        useOfflineStore.setState({ isOnline: false });
        renderWithRouter(<LoginPage />);

        expect(screen.getByText(/Mode hors-ligne/i)).toBeInTheDocument();
        expect(screen.getByText(/Continuer sans connexion/i)).toBeInTheDocument();
    });

    it('displays lockout message after 3 failed attempts', async () => {
        useAuthStore.setState({ loginAttempts: 3 });
        const loginMock = vi.fn().mockRejectedValue({
            response: { status: 401 }
        });
        useAuthStore.setState({ login: loginMock });

        renderWithRouter(<LoginPage />);

        const identifierInput = screen.getByLabelText(/Email ou Matricule/i);
        fireEvent.change(identifierInput, { target: { value: 'user@test.com' } });
        const passwordInput = screen.getByLabelText(/Mot de passe/i);
        fireEvent.change(passwordInput, { target: { value: 'password' } });

        const submitButton = screen.getByRole('button', { name: /SE CONNECTER/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Compte temporairement bloqué/i)).toBeInTheDocument();
        });
    });
});
