/**
 * PDF Genius AI - Design System
 * Premium dark-first theme with light mode support
 */

export const Colors = {
  dark: {
    // Backgrounds
    background: '#0A0A12',
    surface: '#13131F',
    card: '#1A1A2E',
    cardElevated: '#22223A',
    overlay: 'rgba(0,0,0,0.7)',
    glass: 'rgba(99,102,241,0.08)',

    // Borders
    border: '#2A2A42',
    borderLight: '#1E1E36',
    divider: 'rgba(255,255,255,0.06)',

    // Brand
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    accentGlow: 'rgba(245,158,11,0.15)',

    // Semantic
    success: '#10B981',
    successBg: 'rgba(16,185,129,0.12)',
    warning: '#F59E0B',
    warningBg: 'rgba(245,158,11,0.12)',
    error: '#EF4444',
    errorBg: 'rgba(239,68,68,0.12)',
    info: '#3B82F6',
    infoBg: 'rgba(59,130,246,0.12)',

    // Text
    textPrimary: '#F0F0FF',
    textSecondary: '#94A3B8',
    textMuted: '#555570',
    textInverse: '#0A0A12',

    // Special
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
    shimmer: '#1E1E36',
  },
  light: {
    // Backgrounds
    background: '#F0F2FF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#F8F9FF',
    overlay: 'rgba(0,0,0,0.5)',
    glass: 'rgba(99,102,241,0.06)',

    // Borders
    border: '#E2E8F0',
    borderLight: '#EDF2FF',
    divider: 'rgba(0,0,0,0.06)',

    // Brand
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    accentGlow: 'rgba(245,158,11,0.10)',

    // Semantic
    success: '#10B981',
    successBg: 'rgba(16,185,129,0.10)',
    warning: '#D97706',
    warningBg: 'rgba(245,158,11,0.10)',
    error: '#EF4444',
    errorBg: 'rgba(239,68,68,0.10)',
    info: '#3B82F6',
    infoBg: 'rgba(59,130,246,0.10)',

    // Text
    textPrimary: '#1E1B4B',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Special
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
    shimmer: '#E8EEFF',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  '2xl': 64,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Typography = {
  // Page titles
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  h4: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },

  // Body
  bodyLarge: { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 23 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },

  // UI
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelSmall: { fontSize: 12, fontWeight: '500' as const, lineHeight: 17 },
  button: { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 15 },
};

export const Shadows = {
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
  },
  light: {
    sm: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export type ColorScheme = 'dark' | 'light';
export type ThemeColors = typeof Colors.dark;
