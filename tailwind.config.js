/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          accent: '#eab308',
          gold: '#FFD700',
          ruby: '#E11D48',
        },
        cinema: {
          dark: '#07080B',
          obsidian: '#0B0D13',
          surface: '#11141D',
          card: '#151824',
          cardHover: '#1C2030',
          border: '#23283B',
          borderLight: '#323850',
          muted: '#8E95A5',
          textMuted: '#6B7280',
          goldGlow: 'rgba(245, 158, 11, 0.25)',
          rubyGlow: 'rgba(225, 29, 72, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cinema-glow': '0 0 30px -5px rgba(245, 158, 11, 0.3)',
        'cinema-ruby': '0 0 30px -5px rgba(225, 29, 72, 0.3)',
        'cinema-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'cinema-btn': '0 4px 20px -2px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'shake': 'shake 0.45s cubic-bezier(.36,.07,.19,.97) both',
        'pop': 'pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        'float': 'float 3.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(245, 158, 11, 0.35), inset 0 0 12px rgba(245, 158, 11, 0.15)' },
          '50%': { boxShadow: '0 0 32px rgba(245, 158, 11, 0.65), inset 0 0 20px rgba(245, 158, 11, 0.3)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-2px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(4px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-5px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(5px, 0, 0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.88)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
