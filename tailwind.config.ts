import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4ecdf',
        sand: '#dcc7a2',
        ink: '#171717',
        clay: '#a15d43',
        mist: '#fffaf3'
      },
      fontFamily: {
        sans: ['"SF Pro Text"', '"Avenir Next"', '"Segoe UI"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 40px rgba(23, 23, 23, 0.10)'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(220, 199, 162, 0.82), transparent 52%), linear-gradient(180deg, rgba(255, 250, 243, 0.95), rgba(244, 236, 223, 1))'
      }
    }
  },
  plugins: []
};

export default config;

