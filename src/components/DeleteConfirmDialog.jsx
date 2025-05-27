import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import {
    Warning as WarningIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const DeleteConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title = "Подтверждение удаления",
    message = "Вы уверены, что хотите удалить этот элемент?",
    itemName = "",
    loading = false
}) => {
    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    maxWidth="sm"
                    fullWidth
                    PaperComponent={motion.div}
                    PaperProps={{
                        initial: { scale: 0.8, opacity: 0 },
                        animate: { scale: 1, opacity: 1 },
                        exit: { scale: 0.8, opacity: 0 },
                        transition: { duration: 0.3 },
                        sx: {
                            background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: `
                                0 25px 50px rgba(0,0,0,0.3),
                                0 0 0 1px rgba(255, 107, 53, 0.2)
                            `,
                            border: '2px solid rgba(255, 107, 53, 0.3)',
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.2), transparent)',
                        borderBottom: '1px solid rgba(255, 107, 53, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1
                                }}
                            >
                                <WarningIcon sx={{ color: '#ff6b35', fontSize: '2rem' }} />
                            </motion.div>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                '&:hover': {
                                    color: '#ff6b35',
                                    background: 'rgba(255, 107, 53, 0.1)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ py: 3 }}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    mb: 2,
                                    textAlign: 'center'
                                }}
                            >
                                {message}
                            </Typography>

                            {itemName && (
                                <Box sx={{
                                    background: 'rgba(255, 107, 53, 0.1)',
                                    border: '1px solid rgba(255, 107, 53, 0.3)',
                                    borderRadius: 2,
                                    p: 2,
                                    textAlign: 'center'
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#ff8c42',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        &ldquo;{itemName}&rdquo;
                                    </Typography>
                                </Box>
                            )}

                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    mt: 2,
                                    textAlign: 'center',
                                    fontStyle: 'italic'
                                }}
                            >
                                ⚠️ Это действие нельзя отменить
                            </Typography>
                        </motion.div>
                    </DialogContent>

                    <DialogActions sx={{
                        p: 3,
                        gap: 2,
                        justifyContent: 'center'
                    }}>
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                disabled={loading}
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: 'rgba(255,255,255,0.8)',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 3,
                                    '&:hover': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        background: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Отмена
                            </Button>
                        </motion.div>

                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Button
                                onClick={onConfirm}
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 3,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #b71c1c, #d32f2f)',
                                        boxShadow: '0 0 20px rgba(211, 47, 47, 0.5)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(211, 47, 47, 0.3)'
                                    }
                                }}
                            >
                                {loading ? '🗑️ Удаление...' : '🗑️ Удалить'}
                            </Button>
                        </motion.div>
                    </DialogActions>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

DeleteConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    itemName: PropTypes.string,
    loading: PropTypes.bool
};

export default DeleteConfirmDialog;
