import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../context/LanguageContext';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary Component', () => {
    const ThrowError = () => {
        throw new Error('Test error');
    };

    const renderWithProvider = (component) => {
        return render(
            <LanguageProvider>
                {component}
            </LanguageProvider>
        );
    };

    beforeEach(() => {
        // Prevent console.error from cluttering test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('renders children when there is no error', () => {
        const TestChild = () => <div>Test child</div>;
        renderWithProvider(
            <ErrorBoundary>
                <TestChild />
            </ErrorBoundary>
        );
        expect(screen.getByText('Test child')).toBeInTheDocument();
    });

    it('renders error UI when there is an error', () => {
        renderWithProvider(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('provides a way to recover from error', () => {
        const refreshSpy = jest.spyOn(window.location, 'reload');
        renderWithProvider(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );
        fireEvent.click(screen.getByRole('button'));
        expect(refreshSpy).toHaveBeenCalled();
        refreshSpy.mockRestore();
    });
}); 