import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#FF7849',
                light: '#FF9066',
                dark: '#FF6A35',
            },
            secondary: {
                main: '#FF9F7E',
                light: '#FFB39E',
                dark: '#FF8B5E',
            },
            background: {
                default: darkMode ? '#121212' : '#FFFFFF',
                paper: darkMode ? '#1E1E1E' : '#F5F5F5',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 700,
                fontSize: '2.5rem',
            },
            h2: {
                fontWeight: 600,
                fontSize: '2rem',
            },
            h3: {
                fontWeight: 600,
                fontSize: '1.75rem',
            },
            body1: {
                fontSize: '1rem',
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 30,
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '10px 24px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(255, 120, 73, 0.3)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        },
                    },
                },
            },
        },
    });

    const toggleTheme = () => {
        setDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}; 