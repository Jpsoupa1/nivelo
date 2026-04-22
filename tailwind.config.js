/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0C0A1A',
        surface: '#14112A',
        'surface-2': '#1B1736',
        accent: '#E8A835',
        success: '#34D399',
        warning: '#FB923C',
        danger: '#FB7185',
        muted: '#8B82A8',
        border: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
