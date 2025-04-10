import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ShortcutProps, defaultShortcuts } from '@/styles/shortcuts';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps extends ShortcutProps, TouchableOpacityProps {
  variant?: 'contained' | 'outlined' | 'ghost';
  isLoading?: boolean;
}

export const Button = ({
  onPress,
  children,
  variant = "contained",
  isLoading,
  ...restProps
}: ButtonProps) => {
  const { theme } = useTheme();
  
  // Create dynamic styles based on the current theme
  const buttonStyles = {
    contained: {
      button: {
        padding: 14,
        borderRadius: 50,
        backgroundColor: theme.primary,
      },
      text: {
        textAlign: 'center' as const,
        color: 'white',
        fontSize: 18,
      },
    },
    outlined: {
      button: {
        padding: 14,
        borderRadius: 50,
        borderColor: theme.border,
        borderWidth: 1,
        backgroundColor: 'transparent',
      },
      text: {
        textAlign: 'center' as const,
        color: theme.text,
        fontSize: 18,
      },
    },
    ghost: {
      button: {
        padding: 14,
        borderRadius: 50,
        backgroundColor: 'transparent',
      },
      text: {
        textAlign: 'center' as const,
        color: theme.primary,
        fontSize: 18,
      },
    },
  };

  const disabledStyle = {
    opacity: 0.5,
  };

  return (
    <TouchableOpacity
      disabled={isLoading || restProps.disabled}
      onPress={onPress}
      style={[
        defaultShortcuts(restProps),
        buttonStyles[variant].button,
        (isLoading || restProps.disabled) && disabledStyle,
        restProps.style,
      ]}
      {...restProps}
    >
      {isLoading ? (
        <ActivityIndicator 
          animating={isLoading} 
          size={22} 
          color={variant === 'contained' ? 'white' : theme.primary} 
        />
      ) : (
        <Text style={buttonStyles[variant].text}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};
