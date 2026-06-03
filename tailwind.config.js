/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0058bc',
        'primary-deep': '#003d82',
        'on-primary': '#ffffff',
        'primary-container': '#0070eb',
        'on-primary-container': '#fefcff',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc6ff',
        background: '#f4f7fc',
        'on-background': '#0b1c30',
        surface: '#f8f9ff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#414755',
        'surface-subtle': '#F8FAFC',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'surface-container-high': '#dce9ff',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#d3e4fe',
        'border-light': '#E2E8F0',
        'outline-variant': '#c1c6d7',
        secondary: '#605e5f',
        tertiary: '#555d63',
        'tertiary-container': '#6e757c',
        'success-vibrant': '#10B981',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        accent: '#c9a227',
        'accent-soft': '#f5ecd4',
        inbox: '#7c6bcf',
        'inbox-soft': '#ede9fe',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      spacing: {
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        gutter: '24px',
        'container-max': '1280px',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(11, 28, 48, 0.06), 0 1px 2px rgba(11, 28, 48, 0.04)',
        'card-hover':
          '0 20px 40px -12px rgba(0, 88, 188, 0.15), 0 8px 16px -8px rgba(11, 28, 48, 0.08)',
        nav: '0 -4px 24px rgba(11, 28, 48, 0.06)',
        glow: '0 0 0 1px rgba(255,255,255,0.8), 0 8px 32px rgba(0, 88, 188, 0.12)',
        boutique: '0 24px 48px -12px rgba(11, 28, 48, 0.12)',
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0, 88, 188, 0.12), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(124, 107, 207, 0.08), transparent), radial-gradient(ellipse 50% 30% at 50% 100%, rgba(201, 162, 39, 0.06), transparent)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'soft-pulse': 'softPulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
      maxWidth: {
        'container-max': '1280px',
      },
    },
  },
  plugins: [],
}
