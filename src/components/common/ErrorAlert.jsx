import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert 
                onClose={onClose} 
                severity="error" 
                sx={{ width: '100%' }}
            >
                {error}
            </Alert>
        </Snackbar>
    );
};

export default ErrorAlert; 