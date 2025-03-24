import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Stack,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

export default function Recipes() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState({
        name: '',
        description: '',
        ingredients: '',
        instructions: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        calories: '',
        image: '',
        tags: [],
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddRecipe = () => {
        if (newRecipe.name) {
            setRecipes([...recipes, { ...newRecipe, id: Date.now() }]);
            setNewRecipe({
                name: '',
                description: '',
                ingredients: '',
                instructions: '',
                prepTime: '',
                cookTime: '',
                servings: '',
                calories: '',
                image: '',
                tags: [],
            });
            handleClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewRecipe((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            e.preventDefault();
            setNewRecipe((prev) => ({
                ...prev,
                tags: [...prev.tags, e.target.value],
            }));
            e.target.value = '';
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setNewRecipe((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const filteredRecipes = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    {t('recipes')}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    {t('addRecipe')}
                </Button>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder={t('searchRecipes')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
            />

            <Grid container spacing={3}>
                {filteredRecipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={recipe.image || 'https://via.placeholder.com/300x200'}
                                alt={recipe.name}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {recipe.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {recipe.description}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    {recipe.tags.map((tag) => (
                                        <Chip key={tag} label={tag} size="small" />
                                    ))}
                                </Stack>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('prepTime')}: {recipe.prepTime}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('calories')}: {recipe.calories}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{t('addRecipe')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label={t('recipeName')}
                            name="name"
                            value={newRecipe.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('description')}
                            name="description"
                            value={newRecipe.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            label={t('ingredients')}
                            name="ingredients"
                            value={newRecipe.ingredients}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={4}
                        />
                        <TextField
                            fullWidth
                            label={t('instructions')}
                            name="instructions"
                            value={newRecipe.instructions}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={4}
                        />
                        <TextField
                            fullWidth
                            label={t('prepTime')}
                            name="prepTime"
                            value={newRecipe.prepTime}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('cookTime')}
                            name="cookTime"
                            value={newRecipe.cookTime}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('servings')}
                            name="servings"
                            type="number"
                            value={newRecipe.servings}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('calories')}
                            name="calories"
                            type="number"
                            value={newRecipe.calories}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('imageUrl')}
                            name="image"
                            value={newRecipe.image}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('addTags')}
                            onKeyPress={handleAddTag}
                            margin="normal"
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                            {newRecipe.tags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                    size="small"
                                />
                            ))}
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('cancel')}</Button>
                    <Button onClick={handleAddRecipe} variant="contained" color="primary">
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 