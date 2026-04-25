import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyber theme colors
        cyber: {
          bg: {
            primary: '#0a0e17',
            secondary: '#111827',
            tertiary: '#1a1f2e',
          },
          blue: {
            primary: '#00d4ff',
            secondary: '#0ea5e9',
            dark: '#0284c7',
          },
          purple: {
            primary: '#8b5cf6',
            secondary: '#a855f7',
            dark: '#7c3aed',
          },
          teal: {
            primary: '#14b8a6',
            secondary: '#10b981',
            dark: '#059669',
          },
          danger: {
            primary: '#ef4444',
            secondary: '#dc2626',
          },
          warning: {
            primary: '#f59e0b',
            secondary: '#eab308',
          },
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'matrix': 'matrix 20s linear infinite',
        'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff, 0 0 15px #00d4ff' },
          '100%': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px currentColor' },
          '50%': { opacity: '0.8', boxShadow: '0 0 20px currentColor' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#00d4ff' },
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0a0e17 0%, #111827 50%, #1a1f2e 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(26, 31, 46, 0.6) 100%)',
        'glow-gradient': 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 212, 255, 0.3)',
        'cyber-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
        'purple-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'teal-glow': '0 0 20px rgba(20, 184, 166, 0.3)',
        'danger-glow': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
} satisfies Config


