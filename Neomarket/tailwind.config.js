/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Exo 2', 'system-ui', 'sans-serif'],
        display: ['Audiowide', 'Exo 2', 'sans-serif'],
        tech: ['Electrolize', 'Exo 2', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        cyber: ['Share Tech Mono', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'light-slide': 'lightSlide 2s ease-in-out infinite',
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cyber-glow': 'cyber-glow 2s ease-in-out infinite',
        'ping': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'circuit': 'circuit 8s linear infinite',
        'circuit-pan': 'circuit-pan 15s linear infinite',
        'circuit-pan-reverse': 'circuit-pan-reverse 12s linear infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'text-reveal': 'text-reveal 0.5s ease-out forwards',
        'char-reveal': 'char-reveal 0.2s ease-out forwards',
        'marble': 'marble 15s ease-in-out infinite',
        'marble-spin': 'marble-spin 10s linear infinite',
      },
      keyframes: {
        lightSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        marble: {
          '0%, 100%': {
            transform: 'translateX(0%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 0.2, 1)'
          },
          '25%': {
            transform: 'translateX(25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 0.2, 1)'
          },
          '50%': {
            transform: 'translateX(75%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 0.2, 1)'
          },
          '75%': {
            transform: 'translateX(100%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 0.2, 1)'
          }
        },
        'marble-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'text-reveal': {
          '0%': { 
            transform: 'translateX(-20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          }
        },
        'char-reveal': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          }
        },
        pulse: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.15' },
        },
        circuit: {
          '0%': { 
            strokeDashoffset: '200',
          },
          '100%': {
            strokeDashoffset: '0',
          },
        },
        'circuit-pan': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        'circuit-pan-reverse': {
          '0%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
        },
        glow: {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(1)',
            filter: 'blur(2px)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'scale(2)',
            filter: 'blur(4px)',
          },
        },
      },
    },
  },
  plugins: [],
};