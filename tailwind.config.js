/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'space': {
          950: '#050B18',
          900: '#0A1628',
          800: '#0F1F38',
          700: '#162B4A',
          600: '#1E3A5F',
          500: '#2A4F7A',
        },
        'cyber': {
          50: '#E6FBFF',
          100: '#B3F3FF',
          200: '#80EBFF',
          300: '#4DE3FF',
          400: '#1ADBFF',
          500: '#00D4FF',
          600: '#00A8CC',
          700: '#007C99',
          800: '#005066',
          900: '#002433',
        },
        'bio': {
          400: '#33FFB8',
          500: '#00FF9D',
          600: '#00CC7D',
        },
        'warn': {
          400: '#FFA64D',
          500: '#FF8A00',
          600: '#CC6E00',
        },
        'danger': {
          400: '#FF6B85',
          500: '#FF3B5C',
          600: '#CC2F4A',
          700: '#992438',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern':
          "linear-gradient(rgba(0, 212, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.06) 1px, transparent 1px)",
        'radial-glow':
          'radial-gradient(ellipse at top, rgba(0, 212, 255, 0.15), transparent 60%)',
      },
      boxShadow: {
        'glow-cyber': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.1)',
        'glow-danger': '0 0 16px rgba(255, 59, 92, 0.5)',
        'glow-bio': '0 0 16px rgba(0, 255, 157, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan 4s linear infinite',
        'breath': 'breath 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        breath: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
