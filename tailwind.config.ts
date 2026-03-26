import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        foreground: '#f8fafc',
        primary: '#2563eb',
        muted: '#1f2937',
        card: '#111827',
        border: '#334155'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;
