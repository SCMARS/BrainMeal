import { useState, useEffect } from 'react';
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
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

// Spoonacular API configuration
const API_KEY = '221aaa18c36a4222ae50c548540bb69c';
const API_BASE_URL = 'https://api.spoonacular.com/recipes';

export default function Recipes() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    // Fetch recipes from API on component mount
    useEffect(() => {
        fetchRandomRecipes();
    }, []);

    // Function to fetch random recipes from Spoonacular
    const fetchRandomRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/random?number=6&apiKey=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Format the data to match our app structure
            const formattedRecipes = data.recipes.map(recipe => formatSpoonacularRecipe(recipe));

            setRecipes(formattedRecipes);
            setError(null);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(t('errorFetchingRecipes'));
        } finally {
            setLoading(false);
        }
    };

    // Function to search recipes from Spoonacular
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        try {
            if (query.length > 2) {
                setLoading(true);
                const response = await fetch(
                    `${API_BASE_URL}/complexSearch?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&fillIngredients=true&apiKey=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    // Format the data to match our app structure
                    const formattedRecipes = data.results.map(recipe => formatSpoonacularRecipe(recipe));
                    setRecipes(formattedRecipes);
                } else {
                    setRecipes([]);
                }
            } else if (query.length === 0) {
                // If search is cleared, fetch random recipes again
                fetchRandomRecipes();
            }
        } catch (err) {
            console.error('Error searching recipes:', err);
            setError(t('errorSearchingRecipes'));
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format Spoonacular data to our app format
    const formatSpoonacularRecipe = (recipe) => {
        // Format ingredients if available
        let ingredientsText = '';
        if (recipe.extendedIngredients) {
            ingredientsText = recipe.extendedIngredients
                .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
                .join('\n');
        }

        // Extract diets as tags if available
        const tags = recipe.diets || [];

        // Add dishTypes as additional tags if available
        if (recipe.dishTypes && recipe.dishTypes.length > 0) {
            tags.push(...recipe.dishTypes);
        }

        return {
            id: recipe.id,
            name: recipe.title,
            description: recipe.summary ? stripHtml(recipe.summary).substring(0, 150) + '...' : '',
            ingredients: ingredientsText,
            instructions: recipe.instructions ? stripHtml(recipe.instructions) : '',
            prepTime: recipe.preparationMinutes ? `${recipe.preparationMinutes} min` : 'N/A',
            cookTime: recipe.cookingMinutes ? `${recipe.cookingMinutes} min` : 'N/A',
            servings: recipe.servings ? recipe.servings.toString() : '4',
            calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount + ' kcal' || '',
            image: recipe.image,
            tags: tags,
            readyInMinutes: recipe.readyInMinutes,
        };
    };

    // Helper function to strip HTML tags from text
    const stripHtml = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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

    // Spoonacular API doesn't support adding recipes through their API
    // This function adds the recipe locally to state
    const handleAddRecipe = () => {
        if (newRecipe.name) {
            try {
                const newRecipeWithId = {
                    ...newRecipe,
                    id: Date.now().toString(),
                };

                setRecipes([...recipes, newRecipeWithId]);

                // Reset form
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
            } catch (err) {
                console.error('Error adding recipe:', err);
                setError(t('errorAddingRecipe'));
            }
        }
    };

    // Function to get recipe details by ID
    const getRecipeDetails = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/${id}/information?includeNutrition=true&apiKey=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const recipe = await response.json();
            return formatSpoonacularRecipe(recipe);
        } catch (err) {
            console.error('Error fetching recipe details:', err);
            setError(t('errorFetchingRecipeDetails'));
            return null;
        } finally {
            setLoading(false);
        }
    };

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
                onChange={handleSearch}
                sx={{ mb: 4 }}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
            />

            {error && (
                <Box sx={{ mb: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {recipes.length > 0 ? (
                        recipes.map((recipe) => (
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
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>
                                            {recipe.tags && recipe.tags.slice(0, 4).map((tag) => (
                                                <Chip key={tag} label={tag} size="small" />
                                            ))}
                                        </Stack>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                            {recipe.readyInMinutes && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('readyIn')}: {recipe.readyInMinutes} min
                                                </Typography>
                                            )}
                                            {recipe.servings && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('servings')}: {recipe.servings}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography align="center">{t('noRecipesFound')}</Typography>
                        </Grid>
                    )}
                </Grid>
            )}

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
                    <Button
                        onClick={handleAddRecipe}
                        variant="contained"
                        color="primary"
                    >
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}