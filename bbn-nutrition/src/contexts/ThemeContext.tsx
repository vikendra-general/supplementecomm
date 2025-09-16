'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ThemeColors {
  // Brand Colors
  primaryColor: string;        // Main brand color (buttons, links, CTAs)
  secondaryColor: string;      // Secondary brand color (hover states)
  accentColor: string;         // Accent color (highlights, badges)
  
  // Background Colors
  backgroundColor: string;     // Main page background
  cardBackground: string;      // Cards and containers background
  headerBackground: string;    // Header/navigation background
  footerBackground: string;    // Footer background
  
  // Text Colors
  textColor: string;          // Primary text color
  textSecondary: string;      // Secondary text color (descriptions)
  textMuted: string;          // Muted text color (placeholders)
  linkColor: string;          // Link text color
  
  // Form Colors
  inputBackground: string;    // Form input background
  inputBorder: string;        // Form input border
  inputFocus: string;         // Form input focus color
  inputText: string;          // Form input text color
  
  // UI Element Colors
  borderColor: string;        // General border color
  dividerColor: string;       // Divider/separator color
  shadowColor: string;        // Shadow color
  successColor: string;       // Success messages/indicators
  warningColor: string;       // Warning messages/indicators
  errorColor: string;         // Error messages/indicators
  infoColor: string;          // Info messages/indicators
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  resetToDefault: () => void;
  applyTheme: () => void;
}

const defaultColors: ThemeColors = {
  // Brand Colors
  primaryColor: '#38a169',
  secondaryColor: '#2f855a',
  accentColor: '#ed8936',
  
  // Background Colors
  backgroundColor: '#ffffff',
  cardBackground: '#ffffff',
  headerBackground: '#ffffff',
  footerBackground: '#f7fafc',
  
  // Text Colors
  textColor: '#2d3748',
  textSecondary: '#718096',
  textMuted: '#a0aec0',
  linkColor: '#38a169',
  
  // Form Colors
  inputBackground: '#ffffff',
  inputBorder: '#e2e8f0',
  inputFocus: '#38a169',
  inputText: '#2d3748',
  
  // UI Element Colors
  borderColor: '#e2e8f0',
  dividerColor: '#e2e8f0',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  successColor: '#48bb78',
  warningColor: '#ed8936',
  errorColor: '#f56565',
  infoColor: '#4299e1'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bbn-admin-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setColors({ ...defaultColors, ...parsedTheme });
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }
  }, []);

  // Define applyTheme function before using it in useEffect
  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    
    // Brand Colors
    root.style.setProperty('--primary-green', colors.primaryColor);
    root.style.setProperty('--primary-green-dark', colors.secondaryColor);
    root.style.setProperty('--accent-orange', colors.accentColor);
    root.style.setProperty('--color-primary', colors.primaryColor);
    root.style.setProperty('--color-primary-dark', colors.secondaryColor);
    root.style.setProperty('--color-accent-orange', colors.accentColor);
    
    // Background Colors
    root.style.setProperty('--background', colors.backgroundColor);
    root.style.setProperty('--card-background', colors.cardBackground);
    root.style.setProperty('--header-background', colors.headerBackground);
    root.style.setProperty('--footer-background', colors.footerBackground);
    root.style.setProperty('--color-background', colors.backgroundColor);
    root.style.setProperty('--color-card-background', colors.cardBackground);
    root.style.setProperty('--color-header-background', colors.headerBackground);
    root.style.setProperty('--color-footer-background', colors.footerBackground);
    
    // Text Colors
    root.style.setProperty('--foreground', colors.textColor);
    root.style.setProperty('--text-primary', colors.textColor);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--link-color', colors.linkColor);
    root.style.setProperty('--color-foreground', colors.textColor);
    root.style.setProperty('--color-text-primary', colors.textColor);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    root.style.setProperty('--color-link', colors.linkColor);
    
    // Form Colors
    root.style.setProperty('--input-background', colors.inputBackground);
    root.style.setProperty('--input-border', colors.inputBorder);
    root.style.setProperty('--input-focus', colors.inputFocus);
    root.style.setProperty('--input-text', colors.inputText);
    root.style.setProperty('--color-input-background', colors.inputBackground);
    root.style.setProperty('--color-input-border', colors.inputBorder);
    root.style.setProperty('--color-input-focus', colors.inputFocus);
    root.style.setProperty('--color-input-text', colors.inputText);
    
    // UI Element Colors
    root.style.setProperty('--border-light', colors.borderColor);
    root.style.setProperty('--divider-color', colors.dividerColor);
    root.style.setProperty('--shadow-light', colors.shadowColor);
    root.style.setProperty('--success-green', colors.successColor);
    root.style.setProperty('--warning-orange', colors.warningColor);
    root.style.setProperty('--error-red', colors.errorColor);
    root.style.setProperty('--info-blue', colors.infoColor);
    root.style.setProperty('--color-border-light', colors.borderColor);
    root.style.setProperty('--color-divider', colors.dividerColor);
    root.style.setProperty('--color-shadow', colors.shadowColor);
    root.style.setProperty('--color-success-green', colors.successColor);
    root.style.setProperty('--color-warning-orange', colors.warningColor);
    root.style.setProperty('--color-error-red', colors.errorColor);
    root.style.setProperty('--color-info-blue', colors.infoColor);
    
    // Generate lighter and darker variants
    const primaryLight = lightenColor(colors.primaryColor, 20);
    const primaryDark = darkenColor(colors.primaryColor, 20);
    
    root.style.setProperty('--primary-green-light', primaryLight);
    root.style.setProperty('--color-primary-light', primaryLight);
  }, [colors]);

  // Apply theme to CSS variables whenever colors change
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    const updatedColors = { ...colors, ...newColors };
    setColors(updatedColors);
    
    // Save to localStorage
    localStorage.setItem('bbn-admin-theme', JSON.stringify(updatedColors));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
    localStorage.removeItem('bbn-admin-theme');
  };

  // Helper function to lighten a color
  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Helper function to darken a color
  const darkenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  };

  const value: ThemeContextType = {
    colors,
    updateColors,
    resetToDefault,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};