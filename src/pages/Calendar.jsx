import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Snackbar,
    Slide,
    Fade,
    Paper
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TodayIcon from '@mui/icons-material/Today';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';

// Переход для диалога
const DialogTransition = React.forwardRef(function DialogTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Calendar = () => {
    const { t } = useLanguage();
    const { meals, addMeal, updateMeal, deleteMeal, getMealsByDate } = useMealPlan();
    const analyticsRef = useRef(null); // Реф для аналитики

    // Локальное состояние
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openDialog, setOpenDialog] = useState(false);
    const [mealForm, setMealForm] = useState({
        id: null,
        name: '',
        type: '',
        calories: '',
        time: '',
        date: selectedDate,
    });
    const [filter, setFilter] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [nutritionDetails, setNutritionDetails] = useState(null);
    const [reminderActive, setReminderActive] = useState(false);

    // Навигация по календарю: переключение месяца и кнопка "Сегодня"
    const changeMonth = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Открытие/закрытие диалога для добавления/редактирования
    const handleOpenDialog = (meal = null) => {
        if (meal) {
            setMealForm({ ...meal, date: new Date(meal.date) });
            // При редактировании можно сразу получить детальную информацию о питательных веществах
            fetchNutritionDetails(meal.name);
        } else {
            setMealForm({
                id: null,
                name: '',
                type: '',
                calories: '',
                time: '',
                date: selectedDate,
            });
            setNutritionDetails(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setMealForm({
            id: null,
            name: '',
            type: '',
            calories: '',
            time: '',
            date: selectedDate,
        });
        setNutritionDetails(null);
    };

    // Сохранение нового или обновлённого приёма пищи
    const handleSaveMeal = async () => {
        if (mealForm.name && mealForm.type && mealForm.calories && mealForm.time) {
            try {
                const mealData = { ...mealForm, date: selectedDate.toISOString(), calories: Number(mealForm.calories) };
                if (mealForm.id === null) {
                    await addMeal(mealData);
                    setSnackbar({ open: true, message: t('Meal added successfully') });
                } else {
                    await updateMeal(mealForm.id, mealData);
                    setSnackbar({ open: true, message: t('Meal updated successfully') });
                }
            } catch (error) {
                console.error(error);
                setSnackbar({ open: true, message: t('Error saving meal') });
            }
        }
        handleCloseDialog();
    };

    // Удаление приёма пищи
    const handleDeleteMeal = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this meal?'))) {
            try {
                await deleteMeal(id);
                setSnackbar({ open: true, message: t('Meal deleted successfully') });
            } catch (error) {
                console.error(error);
                setSnackbar({ open: true, message: t('Error deleting meal') });
            }
        }
    };

    // Фильтрация приёмов пищи выбранной даты
    const dailyMeals = getMealsByDate(selectedDate).filter(meal =>
        meal.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Симуляция вызова API для получения деталей о питательных веществах
    const fetchNutritionDetails = async (mealName) => {
        setTimeout(() => {
            setNutritionDetails({
                protein: Math.floor(Math.random() * 30) + 10,
                carbs: Math.floor(Math.random() * 50) + 20,
                fat: Math.floor(Math.random() * 20) + 5,
            });
            setSnackbar({ open: true, message: t('Nutrition details updated') });
        }, 1000);
    };

    // Обработчик drag & drop
    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const newDate = new Date(result.destination.droppableId);
        const movedMealId = result.draggableId;
        const movedMeal = meals.find(m => m.id.toString() === movedMealId);
        if (movedMeal) {
            try {
                await updateMeal(movedMeal.id, { ...movedMeal, date: newDate.toISOString() });
                setSnackbar({ open: true, message: t('Meal moved successfully') });
            } catch (error) {
                console.error(error);
                setSnackbar({ open: true, message: t('Error moving meal') });
            }
        }
    };

    // Функция напоминания о приёме пищи (пример)
    const startReminder = () => {
        setReminderActive(true);
        setTimeout(() => {
            setSnackbar({ open: true, message: t('It is time for your next meal!') });
            setReminderActive(false);
        }, 5000);
    };

    // Функция для социального шеринга (если поддерживается)
    const handleShare = async (meal) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('Check out my meal'),
                    text: `${meal.name}: ${meal.calories} ${t('calories')}`,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            setSnackbar({ open: true, message: t('Share is not supported on this device') });
        }
    };

    // Функция прокрутки вниз до блока аналитики
    const scrollDown = () => {
        if (analyticsRef.current) {
            analyticsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Рендер календаря с drag & drop
    const renderCalendar = () => {
        const days = [];
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(<Box key={`empty-${i}`} sx={{ p: 2 }} />);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const currentDate = new Date(year, month, i);
            const isSelected = currentDate.toDateString() === selectedDate.toDateString();
            const dayMeals = meals.filter(meal => new Date(meal.date).toDateString() === currentDate.toDateString());

            days.push(
                <Fade in timeout={300} key={i}>
                    <Card
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.light' : 'background.paper',
                            '&:hover': { bgcolor: 'primary.light' },
                            transition: 'background-color 0.3s ease'
                        }}
                        onClick={() => setSelectedDate(currentDate)}
                    >
                        <Typography variant="h6">{i}</Typography>
                        <Droppable droppableId={currentDate.toISOString()}>
                            {(provided) => (
                                <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ mt: 1, minHeight: 40 }}>
                                    {dayMeals.map((meal, index) => (
                                        <Draggable key={meal.id} draggableId={meal.id.toString()} index={index}>
                                            {(providedDrag) => (
                                                <Box
                                                    ref={providedDrag.innerRef}
                                                    {...providedDrag.draggableProps}
                                                    {...providedDrag.dragHandleProps}
                                                    sx={{
                                                        p: 0.5,
                                                        mb: 0.5,
                                                        bgcolor: 'grey.100',
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <Typography variant="body2" color="text.secondary">
                                                        {meal.name}
                                                    </Typography>
                                                    <Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenDialog(meal);
                                                            }}
                                                        >
                                                            <EditIcon fontSize="inherit" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteMeal(meal.id);
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="inherit" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(meal);
                                                        }}>
                                                            <ShareIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </Card>
                </Fade>
            );
        }
        return days;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {t('calendar')}
            </Typography>

            {/* Навигация по месяцу */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button onClick={() => changeMonth(-1)} startIcon={<ArrowBackIcon />}>
                    {t('Previous')}
                </Button>
                <Button onClick={goToToday} startIcon={<TodayIcon />}>
                    {t('Today')}
                </Button>
                <Button onClick={() => changeMonth(1)} endIcon={<ArrowForwardIcon />}>
                    {t('Next')}
                </Button>
            </Box>

            {/* Фильтр по приёмам пищи */}
            <TextField
                label={t('Filter meals')}
                fullWidth
                margin="normal"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">
                                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </Typography>
                                <Button variant="contained" onClick={() => handleOpenDialog()}>
                                    {t('addMeal')}
                                </Button>
                            </Box>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Grid container spacing={1}>
                                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                                        <Grid item xs key={day}>
                                            <Typography align="center" variant="subtitle2">
                                                {day}
                                            </Typography>
                                        </Grid>
                                    ))}
                                    {/* Область с прокруткой */}
                                    <Box sx={{ width: '100%', maxHeight: 400, overflowY: 'auto' }}>
                                        <Grid container spacing={1}>
                                            {renderCalendar()}
                                        </Grid>
                                    </Box>
                                </Grid>
                            </DragDropContext>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Список приёмов пищи выбранной даты */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {selectedDate.toLocaleDateString()}
                            </Typography>
                            <Box sx={{ mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                                {dailyMeals.map((meal) => (
                                    <Card key={meal.id} sx={{ mb: 1 }}>
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle1">{meal.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {meal.time}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {meal.calories} {t('calories')}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <IconButton size="small" onClick={() => handleOpenDialog(meal)}>
                                                    <EditIcon fontSize="inherit" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteMeal(meal.id)}>
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleShare(meal)}>
                                                    <ShareIcon fontSize="inherit" />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Кнопка прокрутки вниз до аналитики */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined" startIcon={<ExpandMoreIcon />} onClick={scrollDown}>
                    {t('Scroll Down')}
                </Button>
            </Box>

            {/* Блок расширенной аналитики с прокруткой */}
            <Box ref={analyticsRef} sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {t('Weekly Analytics')}
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                    <Typography variant="body1">
                        {t('Here you can display detailed charts and analytics about your weekly calorie intake and nutrient distribution.')}
                    </Typography>
                </Paper>
            </Box>

            {/* Кнопка запуска напоминания */}
            <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={startReminder} disabled={reminderActive}>
                    {t('Set Meal Reminder')}
                </Button>
            </Box>

            {/* Диалог добавления/редактирования */}
            <Dialog open={openDialog} onClose={handleCloseDialog} TransitionComponent={DialogTransition} fullWidth maxWidth="sm">
                <DialogTitle>{mealForm.id === null ? t('addMeal') : t('editMeal')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('mealName')}
                        fullWidth
                        variant="outlined"
                        value={mealForm.name}
                        onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>{t('mealType')}</InputLabel>
                        <Select
                            label={t('mealType')}
                            value={mealForm.type}
                            onChange={(e) => setMealForm({ ...mealForm, type: e.target.value })}
                        >
                            <MenuItem value="breakfast">{t('breakfast')}</MenuItem>
                            <MenuItem value="lunch">{t('lunch')}</MenuItem>
                            <MenuItem value="dinner">{t('dinner')}</MenuItem>
                            <MenuItem value="snack">{t('snack')}</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label={t('calories')}
                        type="number"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        value={mealForm.calories}
                        onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('time')}
                        type="time"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        InputLabelProps={{ shrink: true }}
                        value={mealForm.time}
                        onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                    />
                    {nutritionDetails && (
                        <Box sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2">{t('Nutrition Details')}</Typography>
                            <Typography variant="body2">{t('Protein')}: {nutritionDetails.protein} g</Typography>
                            <Typography variant="body2">{t('Carbs')}: {nutritionDetails.carbs} g</Typography>
                            <Typography variant="body2">{t('Fat')}: {nutritionDetails.fat} g</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
                    <Button onClick={handleSaveMeal} variant="contained">
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar для уведомлений */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default Calendar;


