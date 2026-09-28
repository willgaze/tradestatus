/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // The system stack, so it renders as SF Pro on iOS and Roboto on
        // Android. A trade tool should look like it belongs on the phone it is
        // being held in, not like a website.
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI',
               'Roboto', 'system-ui', 'sans-serif'],
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
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        // Layered and soft. One hard shadow is what makes a page look like 2003.
        card: '0 1px 2px rgba(16,32,52,.04), 0 8px 24px -12px rgba(16,32,52,.18)',
        lift: '0 2px 4px rgba(16,32,52,.05), 0 18px 40px -16px rgba(16,32,52,.28)',
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
