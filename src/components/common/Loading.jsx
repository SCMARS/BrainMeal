import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const Loading = ({ message }) => {
    const { t } = useLanguage();

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <CircularProgress color="primary" size={40} />
            </motion.div>
            {message && (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    {message || t('loading')}
                </Typography>
            )}
        </Box>
    );
};

export default Loading; 