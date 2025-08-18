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
        // BBN-Nutrition Bold & Energetic Palette
        primary: '#00FF73',           // Energetic Green (main brand)
        secondary: '#0B0B0B',         // Deep Black (strength & boldness)
        'accent-1': '#FF6B35',        // Electric Orange (CTAs)
        'accent-2': '#00D4FF',        // Bright Cyan (modern vibe)
        'background-dark': '#121212', // Dark background
        'neutral-light': '#EAEAEA',   // Light gray for text/cards
        
        // Legacy colors for compatibility
        dark: '#0B0B0B',
        'dark-gray': '#1a1a1a',
        'dark-green': '#00cc00',
        'light-green': '#00FF73',
        'hover-light': '#2a2a2a',
        'hover-lighter': '#3a3a3a',
        'admin-hover': '#2d3748',
        'hover-subtle': '#374151',
        'hover-accent': '#1f2937',
      },
      backgroundColor: {
        'dark-bg': '#000000',
        'dark-gray-bg': '#1a1a1a',
        'dark-card': '#111111',
        'hover-bg': '#2a2a2a',
        'admin-hover-bg': '#2d3748',
      },
      textColor: {
        'dark-text': '#ffffff',
        'dark-text-secondary': '#cccccc',
        'hover-text': '#e2e8f0',
      },
    },
  },
  plugins: [],
};

export default config;