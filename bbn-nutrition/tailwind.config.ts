import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'plus-jakarta-sans': ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'sans-serif'],
        'sans': ['var(--font-primary)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-heading)', 'Poppins', 'Inter', 'sans-serif'],
        'display': ['var(--font-display)', 'Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        // Enhanced Nutrabay-Inspired Professional Palette
        primary: '#38a169',           // Natural Green (main brand)
        'primary-dark': '#2f855a',    // Darker Green (hover states)
        'primary-light': '#68d391',   // Light Green (accents)
        secondary: '#f7fafc',         // Light Gray (backgrounds)
        'accent-orange': '#ed8936',   // Warm Orange (CTAs)
        'accent-blue': '#3182ce',     // Trust Blue (links)
        'success-green': '#48bb78',   // Success states
        'warning-orange': '#ed8936',  // Warning states
        'info-blue': '#4299e1',       // Info states
        
        // Nutrabay-Inspired Colors
        'nutrabay-primary': '#1a365d',        // Deep navy blue
        'nutrabay-secondary': '#2d3748',      // Charcoal gray
        'nutrabay-accent': '#ed8936',         // Warm orange
        'nutrabay-success': '#38a169',        // Green for success
        'nutrabay-background': '#f7fafc',     // Light gray background
        'nutrabay-card': '#ffffff',           // Pure white cards
        'nutrabay-text-primary': '#1a202c',   // Dark text
        'nutrabay-text-secondary': '#4a5568', // Medium gray text
        'nutrabay-text-muted': '#718096',     // Light gray text
        'nutrabay-border': '#e2e8f0',         // Light border
        
        // Text colors
        'text-primary': '#2d3748',    // Main text
        'text-secondary': '#718096',  // Secondary text
        
        // Background colors
        'bg-light': '#f7fafc',        // Light backgrounds
        'bg-white': '#ffffff',        // Pure white
        'bg-gray': '#e2e8f0',         // Gray backgrounds
        
        // Border and shadow
        'border-light': '#e2e8f0',    // Light borders
        'shadow-light': 'rgba(0, 0, 0, 0.1)', // Light shadows
        
        // Legacy colors for compatibility (updated to match new theme)
        dark: '#2d3748',
        'dark-gray': '#4a5568',
        'dark-green': '#2f855a',
        'light-green': '#68d391',
        'hover-light': '#e2e8f0',
        'hover-lighter': '#f7fafc',
        'admin-hover': '#e2e8f0',
        'hover-subtle': '#edf2f7',
        'hover-accent': '#e2e8f0',
      },
      backgroundColor: {
        'light-bg': '#ffffff',
        'light-gray-bg': '#f7fafc',
        'light-card': '#ffffff',
        'hover-bg': '#e2e8f0',
        'admin-hover-bg': '#e2e8f0',
        'success-bg': '#f0fff4',
        'warning-bg': '#fffaf0',
        'info-bg': '#ebf8ff',
      },
      textColor: {
        'light-text': '#2d3748',
        'light-text-secondary': '#718096',
        'hover-text': '#2d3748',
        'success-text': '#2f855a',
        'warning-text': '#c05621',
        'info-text': '#2b6cb0',
        // Enhanced spacing system
        'spacing-xs': '0.25rem',
        'spacing-sm': '0.5rem',
        'spacing-md': '1rem',
        'spacing-lg': '1.5rem',
        'spacing-xl': '2rem',
        'spacing-2xl': '3rem',
        'spacing-3xl': '4rem',
      },
      borderRadius: {
        'radius-sm': '0.375rem',
        'radius-md': '0.5rem',
        'radius-lg': '0.75rem',
        'radius-xl': '1rem',
      },
      boxShadow: {
        'nutrabay': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'nutrabay-hover': '0 12px 32px rgba(0, 0, 0, 0.12)',
        'nutrabay-accent': '0 4px 12px rgba(237, 137, 54, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;