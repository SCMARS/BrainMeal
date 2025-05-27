import React from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Typography,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    CloudDone as CloudDoneIcon,
    CloudOff as CloudOffIcon,
    Sync as SyncIcon,
    Error as ErrorIcon
} from '@mui/icons-material';

const SyncStatus = ({ isLoading, error, lastSync, totalMeals = 0 }) => {
    const getStatusInfo = () => {
        if (isLoading) {
            return {
                icon: <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} />,
                label: 'Синхронизация...',
                color: 'info',
                bgColor: 'rgba(33, 150, 243, 0.1)'
            };
        }

        if (error) {
            return {
                icon: <ErrorIcon />,
                label: 'Ошибка синхронизации',
                color: 'error',
                bgColor: 'rgba(244, 67, 54, 0.1)'
            };
        }

        if (lastSync) {
            return {
                icon: <CloudDoneIcon />,
                label: 'Синхронизировано',
                color: 'success',
                bgColor: 'rgba(76, 175, 80, 0.1)'
            };
        }

        return {
            icon: <CloudOffIcon />,
            label: 'Не синхронизировано',
            color: 'warning',
            bgColor: 'rgba(255, 152, 0, 0.1)'
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                background: statusInfo.bgColor,
                borderRadius: 3,
                border: `1px solid rgba(255, 107, 53, 0.2)`,
                backdropFilter: 'blur(10px)'
            }}>
                <motion.div
                    animate={isLoading ? { rotate: 360 } : {}}
                    transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                    {React.cloneElement(statusInfo.icon, {
                        sx: {
                            color: statusInfo.color === 'info' ? '#2196f3' :
                                   statusInfo.color === 'error' ? '#f44336' :
                                   statusInfo.color === 'success' ? '#4caf50' : '#ff9800',
                            fontSize: '1.5rem'
                        }
                    })}
                </motion.div>

                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: 'bold'
                        }}
                    >
                        {statusInfo.label}
                    </Typography>

                    {totalMeals > 0 && (
                        <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                            📊 {totalMeals} блюд в плане
                        </Typography>
                    )}

                    {lastSync && !isLoading && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                display: 'block'
                            }}
                        >
                            🕒 {new Date(lastSync).toLocaleString('ru-RU')}
                        </Typography>
                    )}
                </Box>

                {isLoading && (
                    <CircularProgress
                        size={20}
                        sx={{
                            color: '#ff6b35'
                        }}
                    />
                )}
            </Box>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

export default SyncStatus;
