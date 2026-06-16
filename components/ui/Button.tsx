/**
 * Premium Button Component
 */
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Typography, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const isDisabled = disabled || loading;

  const heightMap = { sm: 40, md: 48, lg: 56 };
  const paddingMap = { sm: 14, md: 20, lg: 28 };
  const fontSizeMap = { sm: 13, md: 15, lg: 16 };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      height: heightMap[size],
      paddingHorizontal: paddingMap[size],
      borderRadius: Radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      opacity: isDisabled ? 0.5 : 1,
    };

    if (fullWidth) base.width = '100%';

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.primary };
      case 'secondary':
        return { ...base, backgroundColor: colors.card };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: colors.error };
      case 'gradient':
        return { ...base, overflow: 'hidden' };
      default:
        return { ...base, backgroundColor: colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontSize: fontSizeMap[size],
      fontWeight: '600',
    };

    switch (variant) {
      case 'outline':
        return { ...base, color: colors.primary };
      case 'ghost':
        return { ...base, color: colors.primary };
      case 'secondary':
        return { ...base, color: colors.textPrimary };
      default:
        return { ...base, color: '#FFFFFF' };
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          getContainerStyle(),
          style,
          pressed && !isDisabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={({ pressed }) => [
        getContainerStyle(),
        style,
        pressed && !isDisabled && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      {content}
    </Pressable>
  );
}
