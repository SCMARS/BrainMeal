import React from 'react';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../../context/LanguageContext';
import Loading from '../Loading';

describe('Loading Component', () => {
    const renderWithProvider = (component) => {
        return render(
            <LanguageProvider>
                {component}
            </LanguageProvider>
        );
    };

    it('renders without crashing', () => {
        renderWithProvider(<Loading />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays custom message when provided', () => {
        const testMessage = 'Test loading message';
        renderWithProvider(<Loading message={testMessage} />);
        expect(screen.getByText(testMessage)).toBeInTheDocument();
    });

    it('renders with correct styling', () => {
        renderWithProvider(<Loading />);
        const container = screen.getByRole('progressbar').parentElement.parentElement;
        expect(container).toHaveStyle({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        });
    });
}); 