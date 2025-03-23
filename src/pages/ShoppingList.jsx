import React, { useState } from 'react';
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
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

const ShoppingList = () => {
    const { t } = useLanguage();
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
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {t('shoppingList')}
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label={t('itemName')}
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label={t('quantity')}
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                            sx={{ width: '150px' }}
                            variant="outlined"
                        />
                        {editingItem ? (
                            <Button
                                variant="contained"
                                onClick={handleSaveEdit}
                                startIcon={<CheckIcon />}
                            >
                                {t('save')}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleAddItem}
                                startIcon={<AddIcon />}
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
                            />
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <List>
                        {items.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {index > 0 && <Divider />}
                                <ListItem>
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
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ShoppingList; 