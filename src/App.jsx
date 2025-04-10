import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { MealPlanProvider } from './context/MealPlanContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import ErrorBoundary from './components/common/ErrorBoundary';
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
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
    {
        path: '/',
        element: <WelcomeScreen />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'home',
                element: <Home />,
            },
            {
                path: 'profile',
                element: <ProtectedRoute><Profile /></ProtectedRoute>,
            },
            {
                path: 'meal-plan',
                element: <ProtectedRoute><MealPlan /></ProtectedRoute>,
            },
            {
                path: 'recipes',
                element: <ProtectedRoute><Recipes /></ProtectedRoute>,
            },
            {
                path: 'analytics',
                element: <ProtectedRoute><Analytics /></ProtectedRoute>,
            },
            {
                path: 'social',
                element: <ProtectedRoute><Social /></ProtectedRoute>,
            },
            {
                path: 'education',
                element: <ProtectedRoute><Education /></ProtectedRoute>,
            },
            {
                path: 'settings',
                element: <ProtectedRoute><Settings /></ProtectedRoute>,
            },
            {
                path: 'achievements',
                element: <ProtectedRoute><Achievements /></ProtectedRoute>,
            },
            {
                path: 'calendar',
                element: <ProtectedRoute><Calendar /></ProtectedRoute>,
            },
            {
                path: 'shopping-list',
                element: <ProtectedRoute><ShoppingList /></ProtectedRoute>,
            },
            {
                path: 'calorie-calculator',
                element: <ProtectedRoute><CalorieCalculator /></ProtectedRoute>,
            },
            {
                path: 'dashboard',
                element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
            },
        ],
    },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }
});

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <MealPlanProvider>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <RouterProvider router={router} />
                                </LocalizationProvider>
                            </MealPlanProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;




