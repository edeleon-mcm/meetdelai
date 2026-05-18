/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06080c',
        'bg-2': '#0b0e14',
        'bg-3': '#11151c',
        ink: '#e6e8eb',
        'ink-muted': '#8b929c',
        'ink-faint': '#4a525c',
        line: '#1f242c',
        accent: '#e6e8eb',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['clamp(2.75rem, 8vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg': ['clamp(1.875rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '400' }],
        'headline-md': ['clamp(1.25rem, 3vw, 1.75rem)', { lineHeight: '1.2', fontWeight: '400' }],
        'mono-label': ['11px', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '400' }],
        'body-lg': ['clamp(1.0625rem, 1.5vw, 1.25rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.65' }],
      },
      borderRadius: {
        DEFAULT: '0',
        sm: '0',
        md: '0',
        lg: '0',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
