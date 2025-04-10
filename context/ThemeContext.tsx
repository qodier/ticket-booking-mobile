import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF9500',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FFCC00',
  gray: '#8E8E93',
  lightGray: '#E5E5EA',
  border: '#C7C7CC',
};

const darkTheme = {
  background: '#1C1C1E',
  text: '#FFFFFF',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  accent: '#FF9F0A',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FFD60A',
  gray: '#8E8E93',
  lightGray: '#38383A',
  border: '#38383A',
};

// Theme context type
type ThemeContextType = {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

// Create context
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get device color scheme
  const colorScheme = useColorScheme();
  
  // State to track if we're using system theme or user preference
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  
  // State for user theme preference (only used if not using system theme)
  const [userThemePreference, setUserThemePreference] = useState<'light' | 'dark'>('light');
  
  // Determine if we're in dark mode
  const isDarkMode = useSystemTheme 
    ? colorScheme === 'dark'
    : userThemePreference === 'dark';
  
  // Get the appropriate theme
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Toggle theme function
  const toggleTheme = useCallback(() => {
    if (useSystemTheme) {
      // If currently using system theme, switch to user preference
      // and set initial user preference to opposite of system
      setUseSystemTheme(false);
      setUserThemePreference(colorScheme === 'dark' ? 'light' : 'dark');
    } else {
      // If using user preference, just toggle it
      setUserThemePreference(prev => prev === 'dark' ? 'light' : 'dark');
    }
  }, [useSystemTheme, colorScheme]);
  
  // Memoize context value
  const contextValue = useMemo(() => ({
    theme,
    isDarkMode,
    toggleTheme,
  }), [theme, isDarkMode, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}