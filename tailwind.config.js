/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf9f6',
          100: '#f5f3ee',
          200: '#ede9e0',
          300: '#e0d9cc',
          400: '#c9bfaf',
          500: '#b0a490',
          600: '#8f8070',
          700: '#6e6254',
          800: '#4f4639',
          900: '#322c23',
        },
        blue: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        sage: {
          50: '#f3f7f4',
          100: '#e4ede6',
          200: '#c4d9c8',
          300: '#99bfa0',
          400: '#6b9f76',
          500: '#4a8057',
          600: '#386644',
          700: '#2c5036',
          800: '#213d29',
          900: '#172c1d',
        },
      },
      fontFamily: {
        sans: ['Söhne', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Tiempos Text', 'Georgia', 'ui-serif', 'serif'],
        mono: ['Söhne Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'sm': '0.375rem',
        DEFAULT: '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card': '0 2px 8px 0 rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.05)',
        'elevated': '0 4px 16px 0 rgb(0 0 0 / 0.10), 0 2px 6px -1px rgb(0 0 0 / 0.06)',
        'modal': '0 20px 60px 0 rgb(0 0 0 / 0.15), 0 8px 24px -4px rgb(0 0 0 / 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.6s linear infinite',
        'progress-bar': 'progressBar 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progressBar: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
}
