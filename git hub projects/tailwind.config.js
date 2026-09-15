/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aerocold: {
          950: '#060a12',
          900: '#0b1120',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        cyan: {
          glow: '#00f0ff',
          dim: 'rgba(0, 240, 255, 0.2)',
        },
        hazard: {
          red: '#ff003c',
          amber: '#ffb700',
          green: '#00ff88',
          blue: '#00b4d8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Roboto Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
