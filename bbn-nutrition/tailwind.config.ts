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
        primary: '#00ff00',
        dark: '#000000',
        'dark-gray': '#1a1a1a',
        'dark-green': '#00cc00',
        'light-green': '#00ff33',
      },
      backgroundColor: {
        'dark-bg': '#000000',
        'dark-gray-bg': '#1a1a1a',
        'dark-card': '#111111',
      },
      textColor: {
        'dark-text': '#ffffff',
        'dark-text-secondary': '#cccccc',
      },
    },
  },
  plugins: [],
};

export default config; 