import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // iHerb-Inspired Clean & Professional Health Palette
        primary: '#38a169',           // Natural Green (main brand)
        'primary-dark': '#2f855a',    // Darker Green (hover states)
        'primary-light': '#68d391',   // Light Green (accents)
        secondary: '#f7fafc',         // Light Gray (backgrounds)
        'accent-orange': '#ed8936',   // Warm Orange (CTAs)
        'accent-blue': '#3182ce',     // Trust Blue (links)
        'success-green': '#48bb78',   // Success states
        'warning-orange': '#ed8936',  // Warning states
        'info-blue': '#4299e1',       // Info states
        
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
      },
    },
  },
  plugins: [],
};

export default config;