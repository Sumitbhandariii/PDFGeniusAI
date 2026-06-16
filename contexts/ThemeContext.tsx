/**
 * Theme Context - Manages dark/light mode with persistence
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'dark',
  colors: Colors.dark,
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_KEY = 'pdf_genius_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setColorScheme(saved);
      }
    });
  }, []);

  const toggleTheme = () => {
    const next: ColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    AsyncStorage.setItem(THEME_KEY, next);
  };

  const setTheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    AsyncStorage.setItem(THEME_KEY, scheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        colors: Colors[colorScheme],
        isDark: colorScheme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
