import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotification } from '../../context/NotificationContext';

const Notification = () => {
    const { notification, hideNotification } = useNotification();

    if (!notification) return null;

    return (
        <Snackbar
            open={!!notification}
            autoHideDuration={6000}
            onClose={hideNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                onClose={hideNotification}
                severity={notification.type}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default Notification; 