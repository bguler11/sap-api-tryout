/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        sap: {
          blue: '#0070F2',
          darkblue: '#0040B0',
          gold: '#F0AB00',
          gray: '#F5F6F7',
          darkgray: '#1B1F24',
          border: '#D9D9D9',
        },
        ink: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)',
        card: '0 1px 3px rgba(15,23,42,0.05), 0 10px 30px -12px rgba(15,23,42,0.15)',
        glow: '0 8px 24px -6px rgba(0,112,242,0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0070F2 0%, #0047C0 100%)',
        'brand-radial': 'radial-gradient(1200px 600px at 20% -10%, rgba(0,112,242,0.10), transparent 60%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rise': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'float-a': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(30px,-40px) scale(1.15)' },
        },
        'float-b': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-40px,30px) scale(1.1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'rise': 'rise 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'float-a': 'float-a 14s ease-in-out infinite',
        'float-b': 'float-b 18s ease-in-out infinite',
        'shimmer': 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
