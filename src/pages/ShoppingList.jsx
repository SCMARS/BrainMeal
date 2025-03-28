import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
    Checkbox,
    Divider,
    Chip,
    ThemeProvider,
    createTheme,
    CssBaseline,
    useMediaQuery,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Check as CheckIcon,
    Brightness4 as ThemeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ShoppingList = () => {
    const { t } = useLanguage();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode);

    const theme = useMemo(() =>
        createTheme({
            palette: {
                mode: isDarkMode ? 'dark' : 'light',
                primary: {
                    main: isDarkMode ? '#90caf9' : '#1976d2',
                },
                background: {
                    default: isDarkMode ? '#121212' : '#f4f4f4',
                    paper: isDarkMode ? '#1e1e1e' : '#ffffff',
                },
            },
            typography: {
                fontFamily: 'Roboto, Arial, sans-serif',
            },
            components: {
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: 12,
                            transition: 'all 0.3s ease',
                            boxShadow: isDarkMode
                                ? '0 4px 6px rgba(0,0,0,0.3)'
                                : '0 4px 6px rgba(0,0,0,0.1)',
                        }
                    }
                }
            }
        }), [isDarkMode]
    );

    const [items, setItems] = useState([
        { id: 1, name: 'Молоко', quantity: '2 л', category: 'dairy', completed: false },
        { id: 2, name: 'Хлеб', quantity: '2 шт', category: 'bakery', completed: false },
        { id: 3, name: 'Яблоки', quantity: '1 кг', category: 'fruits', completed: false },
    ]);
    const [newItem, setNewItem] = useState({ name: '', quantity: '', category: 'other' });
    const [editingItem, setEditingItem] = useState(null);

    const handleAddItem = () => {
        if (newItem.name.trim()) {
            setItems([
                ...items,
                {
                    id: Date.now(),
                    ...newItem,
                    completed: false,
                },
            ]);
            setNewItem({ name: '', quantity: '', category: 'other' });
        }
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleToggleComplete = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setNewItem({ name: item.name, quantity: item.quantity, category: item.category });
    };

    const handleSaveEdit = () => {
        if (editingItem && newItem.name.trim()) {
            setItems(items.map(item =>
                item.id === editingItem.id
                    ? { ...item, ...newItem }
                    : item
            ));
            setEditingItem(null);
            setNewItem({ name: '', quantity: '', category: 'other' });
        }
    };

    const categories = {
        dairy: t('dairy'),
        bakery: t('bakery'),
        fruits: t('fruits'),
        vegetables: t('vegetables'),
        meat: t('meat'),
        other: t('other'),
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    p: 3,
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    transition: 'background-color 0.3s ease',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        {t('shoppingList')}
                    </Typography>
                    <IconButton onClick={() => setIsDarkMode(!isDarkMode)}>
                        <ThemeIcon />
                    </IconButton>
                </Box>

                <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ mb: 3 }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label={t('itemName')}
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                            <TextField
                                label={t('quantity')}
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                sx={{ width: '150px', borderRadius: 2 }}
                                variant="outlined"
                            />
                            {editingItem ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSaveEdit}
                                    startIcon={<CheckIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t('save')}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleAddItem}
                                    startIcon={<AddIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t('add')}
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {Object.entries(categories).map(([key, value]) => (
                                <Chip
                                    key={key}
                                    label={value}
                                    onClick={() => setNewItem({ ...newItem, category: key })}
                                    color={newItem.category === key ? 'primary' : 'default'}
                                    sx={{ borderRadius: 2 }}
                                />
                            ))}
                        </Box>
                    </CardContent>
                </Card>

                <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <CardContent>
                        <AnimatePresence>
                            <List>
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {index > 0 && <Divider />}
                                        <ListItem
                                            component={motion.div}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={item.completed}
                                                    onChange={() => handleToggleComplete(item.id)}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.name}
                                                secondary={`${item.quantity} • ${categories[item.category]}`}
                                                sx={{
                                                    textDecoration: item.completed ? 'line-through' : 'none',
                                                    color: item.completed ? 'text.secondary' : 'text.primary',
                                                }}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleEditItem(item)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    </motion.div>
                                ))}
                            </List>
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </Box>
        </ThemeProvider>
    );
};

export default ShoppingList;
