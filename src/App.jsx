import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { MealPlanProvider } from './context/MealPlanContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import ErrorBoundary from './components/common/ErrorBoundary';
import Notification from './components/common/Notification';
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import WelcomeScreen from "./pages/WelcomeScreen";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MealPlan from "./pages/MealPlan";
import Recipes from "./pages/Recipes";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Education from "./pages/Education";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import Calendar from "./pages/Calendar";
import ShoppingList from "./pages/ShoppingList";
import CalorieCalculator from "./pages/CalorieCalculator";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LanguageProvider>
                    <ErrorBoundary>
                        <NotificationProvider>
                            <MealPlanProvider>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Router>
                                        <Notification />
                                        <Routes>
                                            <Route path="/" element={<WelcomeScreen />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/register" element={<Register />} />
                                            <Route path="/home" element={<Layout><Home /></Layout>} />
                                            <Route path="/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
                                            <Route path="/meal-plan" element={<Layout><ProtectedRoute><MealPlan /></ProtectedRoute></Layout>} />
                                            <Route path="/recipes" element={<Layout><ProtectedRoute><Recipes /></ProtectedRoute></Layout>} />
                                            <Route path="/analytics" element={<Layout><ProtectedRoute><Analytics /></ProtectedRoute></Layout>} />
                                            <Route path="/social" element={<Layout><ProtectedRoute><Social /></ProtectedRoute></Layout>} />
                                            <Route path="/education" element={<Layout><ProtectedRoute><Education /></ProtectedRoute></Layout>} />
                                            <Route path="/settings" element={<Layout><ProtectedRoute><Settings /></ProtectedRoute></Layout>} />
                                            <Route path="/achievements" element={<Layout><ProtectedRoute><Achievements /></ProtectedRoute></Layout>} />
                                            <Route path="/calendar" element={<Layout><ProtectedRoute><Calendar /></ProtectedRoute></Layout>} />
                                            <Route path="/shopping-list" element={<Layout><ProtectedRoute><ShoppingList /></ProtectedRoute></Layout>} />
                                            <Route path="/calorie-calculator" element={<Layout><ProtectedRoute><CalorieCalculator /></ProtectedRoute></Layout>} />
                                        </Routes>
                                    </Router>
                                </LocalizationProvider>
                            </MealPlanProvider>
                        </NotificationProvider>
                    </ErrorBoundary>
                </LanguageProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;




