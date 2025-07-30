export const Colors = {
  // Elite Dangerous inspired color scheme
  primary: '#000000',
  primaryDark: '#0a0a0a',
  secondary: '#1a1a1a',
  tertiary: '#2a2a2a',
  
  // Accent colors from Elite Dangerous UI
  accent: '#ff6600', // Orange accent
  accentSecondary: '#00b4d8', // Blue accent
  success: '#00ff00',
  warning: '#ffff00',
  danger: '#ff0000',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textTertiary: '#999999',
  
  // UI colors
  border: '#333333',
  input: '#1a1a1a',
  card: '#0f0f0f',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  // Status colors
  online: '#00ff00',
  offline: '#ff0000',
  inactive: '#ffff00',
};

export const Fonts = {
  primary: 'Orbitron-Regular',
  primaryBold: 'Orbitron-Bold',
  secondary: 'RobotoMono-Regular',
  secondaryBold: 'RobotoMono-Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const Shadows = {
  small: {
    shadowColor: Colors.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.accent,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
