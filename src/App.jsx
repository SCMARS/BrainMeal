import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { MealPlanProvider } from './context/MealPlanContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, CircularProgress } from '@mui/material';

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
import Profile from "./pages/Profile.jsx";
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
import Dashboard from "./pages/Dashboard";

// Route wrapper component to handle route state
const RouteWrapper = ({ children }) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, [location]);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return children;
};

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
                                            
                                            {/* Protected Routes */}
                                            <Route path="/dashboard" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Dashboard />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/home" element={
                                                <Layout>
                                                    <RouteWrapper>
                                                        <Home />
                                                    </RouteWrapper>
                                                </Layout>
                                            } />
                                            <Route path="/profile" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Profile />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/meal-plan" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <MealPlan />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/recipes" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Recipes />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/analytics" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Analytics />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/social" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Social />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/education" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Education />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/settings" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Settings />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/achievements" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Achievements />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/calendar" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <Calendar />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/shopping-list" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <ShoppingList />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/calorie-calculator" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <RouteWrapper>
                                                            <CalorieCalculator />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="*" element={<Navigate to="/" replace />} />
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




