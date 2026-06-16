/**
 * useTheme Hook - Access theme colors and utilities
 */
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  return useContext(ThemeContext);
}
