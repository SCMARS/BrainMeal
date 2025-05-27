import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { MealPlanProvider } from './context/MealPlanContext';
import { AchievementsProvider } from './context/AchievementsContext';
import { SettingsProvider } from './context/SettingsContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PropTypes from 'prop-types';

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
import DetailedMealPlanner from "./pages/DetailedMealPlanner";
import Subscription from "./pages/Subscription";
import PaymentResult from "./components/PaymentResult";

// Route wrapper component to handle route state
const RouteWrapper = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        // Можно добавить логику загрузки здесь при необходимости
    }, [location]);

    return children;
};

RouteWrapper.propTypes = {
    children: PropTypes.node.isRequired
};

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <SubscriptionProvider>
                                <MealPlanProvider>
                                    <AchievementsProvider>
                                        <SettingsProvider>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                        <Notification />
                                        <Routes>
                                            <Route path="/" element={<WelcomeScreen />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/register" element={<Register />} />

                                            {/* Protected Routes */}
                                            <Route path="/dashboard" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Dashboard />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/home" element={
                                                <Layout>
                                                    <Home />
                                                </Layout>
                                            } />
                                            <Route path="/profile" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Profile />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/meal-plan" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <MealPlan />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/recipes" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Recipes />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/analytics" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Analytics />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/social" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Social />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/education" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Education />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/settings" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Settings />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/achievements" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Achievements />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/calendar" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Calendar />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/shopping-list" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <ShoppingList />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/calorie-calculator" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <CalorieCalculator />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/detailed-meal-planner" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <DetailedMealPlanner />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/subscription" element={
                                                <Layout>
                                                    <ProtectedRoute>
                                                        <Subscription />
                                                    </ProtectedRoute>
                                                </Layout>
                                            } />
                                            <Route path="/payment-result" element={<PaymentResult />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </Router>
                                        </LocalizationProvider>
                                    </SettingsProvider>
                                </AchievementsProvider>
                            </MealPlanProvider>
                        </SubscriptionProvider>
                    </NotificationProvider>
                </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;




