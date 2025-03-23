import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { MealPlanProvider } from './context/MealPlanContext';

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

// Layout Components
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LanguageProvider>
                    <NotificationProvider>
                        <MealPlanProvider>
                            <Router>
                                <Routes>
                                    <Route path="/" element={<WelcomeScreen />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/home" element={<Layout><Home /></Layout>} />
                                    <Route path="/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
                                    <Route path="/MealPlan" element={<Layout><ProtectedRoute><MealPlan /></ProtectedRoute></Layout>} />
                                    <Route path="/Recipes" element={<Layout><ProtectedRoute><Recipes /></ProtectedRoute></Layout>} />
                                    <Route path="/Analytics" element={<Layout><ProtectedRoute><Analytics /></ProtectedRoute></Layout>} />
                                    <Route path="/Social" element={<Layout><ProtectedRoute><Social /></ProtectedRoute></Layout>} />
                                    <Route path="/Education" element={<Layout><ProtectedRoute><Education /></ProtectedRoute></Layout>} />
                                    <Route path="/Settings" element={<Layout><ProtectedRoute><Settings /></ProtectedRoute></Layout>} />
                                    <Route path="/Achievements" element={<Layout><ProtectedRoute><Achievements /></ProtectedRoute></Layout>} />
                                    <Route path="/Calendar" element={<Layout><ProtectedRoute><Calendar /></ProtectedRoute></Layout>} />
                                    <Route path="/ShoppingList" element={<Layout><ProtectedRoute><ShoppingList /></ProtectedRoute></Layout>} />
                                    <Route path="/CalorieCalculator" element={<Layout><ProtectedRoute><CalorieCalculator /></ProtectedRoute></Layout>} />
                                </Routes>
                            </Router>
                        </MealPlanProvider>
                    </NotificationProvider>
                </LanguageProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;




