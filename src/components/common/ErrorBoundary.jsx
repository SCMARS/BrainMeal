import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const defaultTranslations = {
    somethingWentWrong: 'Something went wrong',
    errorOccurred: 'An error occurred. Please try refreshing the page.',
    refreshPage: 'Refresh Page'
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // You can also log the error to an error reporting service here
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="80vh"
                    p={3}
                >
                    <Typography variant="h4" gutterBottom color="error">
                        {defaultTranslations.somethingWentWrong}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        {defaultTranslations.errorOccurred}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.reload()}
                    >
                        {defaultTranslations.refreshPage}
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 