/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // ── EdTech palette ───────────────────────────────────────
        // Indigo/blue = trust, focus, calm (primary learning color)
        // Coral = warmth, encouragement (calls-to-action accent)
        // Emerald = success, progress, "you got it right"
        indigo: {
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE',
          400: '#818CF8', 500: '#4F46E5', 600: '#4338CA',
          700: '#3730A3', 900: '#1E1B4B',
        },
        coral: {
          50: '#FFF1ED', 100: '#FFE0D6',
          400: '#FF8A65', 500: '#F4623A', 600: '#DD4E2A',
        },
        emerald: {
          50: '#ECFDF5', 100: '#D1FAE5',
          400: '#34D399', 500: '#10B981', 600: '#059669',
        },
        // Neutral "ink" text scale + soft slate backgrounds
        ink: {
          900: '#0F172A', 700: '#1E293B', 500: '#475569', 400: '#64748B',
        },
        paper: '#F8FAFC',
        cream: {
          100: '#F1F5F9', 200: '#E9EEF5', 300: '#E2E8F0', 400: '#CBD5E1',
        },
        // Aliases so existing components keep working with the new palette
        brand: {
          50: '#EEF2FF', 100: '#E0E7FF', 400: '#818CF8',
          500: '#4F46E5', 600: '#4338CA', 900: '#1E1B4B',
        },
        // clay -> coral (warm accent / primary buttons stay vivid)
        clay: {
          50: '#FFF1ED', 100: '#FFE0D6', 400: '#FF8A65',
          500: '#F4623A', 600: '#DD4E2A',
        },
        // sage -> emerald (success/progress)
        sage: { 400: '#34D399', 500: '#10B981', 600: '#059669' },
        // gold -> amber (highlights)
        gold: { 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
        surface: {
          900: '#F8FAFC', 800: '#FFFFFF', 700: '#F1F5F9',
          600: '#E2E8F0', 500: '#CBD5E1',
        },
        accent: '#F59E0B',
      },
      boxShadow: {
        'paper': '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        'lift': '0 2px 4px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.10)',
        'glow': '0 0 0 3px rgba(79,70,229,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
