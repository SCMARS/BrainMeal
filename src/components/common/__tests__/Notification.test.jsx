import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider } from '../../../context/NotificationContext';
import Notification from '../Notification';

describe('Notification Component', () => {
    const renderWithProvider = (component) => {
        return render(
            <NotificationProvider>
                {component}
            </NotificationProvider>
        );
    };

    it('renders nothing when there is no notification', () => {
        const { container } = renderWithProvider(<Notification />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders notification with correct message and type', () => {
        const TestComponent = () => {
            const { showNotification } = React.useContext(NotificationContext);
            React.useEffect(() => {
                showNotification('Test message', 'success');
            }, []);
            return <Notification />;
        };

        renderWithProvider(<TestComponent />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('automatically hides notification after duration', async () => {
        jest.useFakeTimers();
        const TestComponent = () => {
            const { showNotification } = React.useContext(NotificationContext);
            React.useEffect(() => {
                showNotification('Test message', 'success');
            }, []);
            return <Notification />;
        };

        renderWithProvider(<TestComponent />);
        expect(screen.getByText('Test message')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        jest.useRealTimers();
    });
}); 