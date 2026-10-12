/** @type {import('tailwindcss').Config} */
const FLAT = '0 0 0 1px rgb(var(--glass-line) / var(--glass-line-alpha))'
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    // ONE CORNER RADIUS. Every rounded-* utility is the same --r token
    // (src/app/globals.css), so there is no decision to make and nothing to
    // get wrong: sm, md, xl and 2xl all draw the same corner. Only `full`
    // differs, and it is for things that are genuinely round (dots, chips).
    borderRadius: {
      none: '0', sm: 'var(--r)', DEFAULT: 'var(--r)', md: 'var(--r)', lg: 'var(--r)',
      xl: 'var(--r)', '2xl': 'var(--r)', '3xl': 'var(--r)', '4xl': 'var(--r)', '5xl': 'var(--r)',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        // Geist, self-hosted via next/font (see src/app/layout.js), with the
        // system stack behind it for the moment before it loads. One face on
        // every phone, so a screenshot from an Android and one from an iPhone
        // are the same product.
        sans: ['var(--font-geist-sans)', '-apple-system', 'BlinkMacSystemFont',
               'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4fb', 100: '#d7e6f6', 200: '#b3cfee', 300: '#8bb4e2',
          400: '#5b90cd', 500: '#2f6fb5', 600: '#255a95', 700: '#1d4675',
          800: '#16375c', 900: '#122a46', 950: '#0b1a2c',
        },
        // One per stage, so the page reads at arm's length without the words.
        stage: {
          booked: '#6b7f96',
          onway:  '#f0a202',
          onsite: '#2f6fb5',
          paused: '#c2410c',
          done:   '#15803d',
        },
      },
      // Flat. A surface is told apart by a hairline, not by a shadow, so every
      // shadow-* utility is the same one-pixel ring. Nothing floats.
      boxShadow: {
        sm: FLAT, DEFAULT: FLAT, md: FLAT, lg: FLAT, xl: FLAT, '2xl': FLAT,
        card: FLAT, lift: FLAT,
      },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: .55 },
                     '70%': { transform: 'scale(2.1)', opacity: 0 },
                     '100%': { transform: 'scale(2.1)', opacity: 0 } },
      },
      animation: {
        rise: 'rise .45s cubic-bezier(.22,1,.36,1) both',
        ring: 'pulseRing 2.4s cubic-bezier(.22,1,.36,1) infinite',
      },
    },
  },
  plugins: [],
}
