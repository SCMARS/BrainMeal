import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';

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
                        {this.props.t('somethingWentWrong')}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        {this.props.t('errorOccurred')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.reload()}
                    >
                        {this.props.t('refreshPage')}
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

const ErrorBoundaryWrapper = (props) => {
    const { t } = useLanguage();
    return <ErrorBoundary {...props} t={t} />;
};

export default ErrorBoundaryWrapper; 