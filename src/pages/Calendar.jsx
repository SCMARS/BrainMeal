import React, { useState } from 'react';
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
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

const Calendar = () => {
    const { t } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [meals, setMeals] = useState([]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const handleAddMeal = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMeal(null);
    };

    const handleSaveMeal = () => {
        // Здесь будет логика сохранения приема пищи
        handleCloseDialog();
    };

    const renderCalendar = () => {
        const days = [];
        const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        // Добавляем пустые ячейки для дней до первого дня месяца
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(<Box key={`empty-${i}`} sx={{ p: 2 }} />);
        }

        // Добавляем дни месяца
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
            const isSelected = currentDate.toDateString() === selectedDate.toDateString();
            
            days.push(
                <Card
                    key={i}
                    sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.light' : 'background.paper',
                        '&:hover': { bgcolor: 'primary.light' },
                    }}
                    onClick={() => handleDateSelect(currentDate)}
                >
                    <Typography variant="h6">{i}</Typography>
                    <Box sx={{ mt: 1 }}>
                        {meals
                            .filter(meal => new Date(meal.date).toDateString() === currentDate.toDateString())
                            .map((meal, index) => (
                                <Typography key={index} variant="body2" color="text.secondary">
                                    {meal.name}
                                </Typography>
                            ))}
                    </Box>
                </Card>
            );
        }

        return days;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {t('calendar')}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">
                                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </Typography>
                                <Button variant="contained" onClick={handleAddMeal}>
                                    {t('addMeal')}
                                </Button>
                            </Box>
                            <Grid container spacing={1}>
                                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                                    <Grid item xs key={day}>
                                        <Typography align="center" variant="subtitle2">
                                            {day}
                                        </Typography>
                                    </Grid>
                                ))}
                                {renderCalendar()}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {selectedDate.toLocaleDateString()}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {meals
                                    .filter(meal => new Date(meal.date).toDateString() === selectedDate.toDateString())
                                    .map((meal, index) => (
                                        <Card key={index} sx={{ mb: 1 }}>
                                            <CardContent>
                                                <Typography variant="subtitle1">{meal.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {meal.time}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {meal.calories} {t('calories')}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('addMeal')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('mealName')}
                        fullWidth
                        variant="outlined"
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>{t('mealType')}</InputLabel>
                        <Select label={t('mealType')}>
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
                    />
                    <TextField
                        margin="dense"
                        label={t('time')}
                        type="time"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
                    <Button onClick={handleSaveMeal} variant="contained">
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Calendar; 