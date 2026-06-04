/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        'primary-deep': 'var(--color-primary-deep)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary-container': 'var(--color-on-primary-container)',
        'primary-fixed': 'rgb(var(--primary-fixed-rgb) / <alpha-value>)',
        'primary-fixed-dim': 'var(--color-primary-fixed-dim)',
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'surface-subtle': 'rgb(var(--surface-subtle-rgb) / <alpha-value>)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-low': 'rgb(var(--surface-container-low-rgb) / <alpha-value>)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-lowest': 'rgb(var(--surface-container-lowest-rgb) / <alpha-value>)',
        'surface-variant': 'var(--color-surface-variant)',
        'border-light': 'var(--color-border-light)',
        'outline-variant': 'var(--color-outline-variant)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        'tertiary-container': 'var(--color-tertiary-container)',
        'success-vibrant': 'var(--color-success-vibrant)',
        error: 'rgb(var(--error-rgb) / <alpha-value>)',
        'error-container': 'rgb(var(--error-container-rgb) / <alpha-value>)',
        'on-error-container': 'var(--color-on-error-container)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft-rgb) / <alpha-value>)',
        inbox: 'rgb(var(--inbox-rgb) / <alpha-value>)',
        'inbox-soft': 'rgb(var(--inbox-soft-rgb) / <alpha-value>)',
        glow: 'var(--color-glow)',
      },
      fontFamily: {
        display: ['Rubik', 'Heebo', 'sans-serif'],
        body: ['Heebo', 'Rubik', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-lg': [
          'clamp(2.25rem, 5vw, 3rem)',
          { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' },
        ],
        'headline-lg': [
          'clamp(1.75rem, 4vw, 2rem)',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'headline-lg-mobile': [
          '1.75rem',
          { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'headline-md': [
          '1.375rem',
          { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '600' },
        ],
        'body-lg': ['1.125rem', { lineHeight: '1.65', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'label-md': [
          '0.875rem',
          { lineHeight: '1.35', letterSpacing: '0.02em', fontWeight: '600' },
        ],
        'label-sm': [
          '0.75rem',
          { lineHeight: '1.35', letterSpacing: '0.04em', fontWeight: '500' },
        ],
      },
      spacing: {
        'margin-mobile': '1rem',
        'margin-desktop': '2.5rem',
        gutter: '1.5rem',
        'container-max': '1280px',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        nav: 'var(--shadow-nav)',
        glow: 'var(--shadow-glow)',
        boutique: 'var(--shadow-boutique)',
        'inner-glow': 'var(--shadow-inner-glow)',
      },
      backgroundImage: {
        'mesh-gradient': 'var(--bg-mesh)',
        'card-shine': 'var(--bg-card-shine)',
        'tech-grid': 'var(--bg-tech-grid)',
        'text-gradient': 'var(--bg-text-gradient)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'soft-pulse': 'softPulse 5s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      maxWidth: {
        'container-max': '1280px',
      },
    },
  },
  plugins: [],
}
