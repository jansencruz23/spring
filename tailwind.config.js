/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coral:         'rgb(var(--coral) / <alpha-value>)',
        'coral-deep':  'rgb(var(--coral-deep) / <alpha-value>)',
        'coral-soft':  'rgb(var(--coral-soft) / <alpha-value>)',
        'coral-whisper': 'rgb(var(--coral-whisper) / <alpha-value>)',
        sage:          'rgb(var(--sage) / <alpha-value>)',
        'sage-deep':   'rgb(var(--sage-deep) / <alpha-value>)',
        'sage-soft':   'rgb(var(--sage-soft) / <alpha-value>)',
        butter:        'rgb(var(--butter) / <alpha-value>)',
        'butter-deep': 'rgb(var(--butter-deep) / <alpha-value>)',
        'butter-soft': 'rgb(var(--butter-soft) / <alpha-value>)',
        cream:         'rgb(var(--cream) / <alpha-value>)',
        ivory:         'rgb(var(--ivory) / <alpha-value>)',
        sand:          'rgb(var(--sand) / <alpha-value>)',
        stone:         'rgb(var(--stone) / <alpha-value>)',
        bark:          'rgb(var(--bark) / <alpha-value>)',
        espresso:      'rgb(var(--espresso) / <alpha-value>)',
        'ink-soft':    'rgb(var(--ink-soft) / <alpha-value>)',
        success:       'rgb(var(--success) / <alpha-value>)',
        danger:        'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
        display: ['Fraunces_400Regular'],
        'display-medium': ['Fraunces_500Medium'],
        'display-semibold': ['Fraunces_600SemiBold'],
      },
      borderRadius: {
        card: '22px',
        chip: '14px',
      },
    },
  },
  plugins: [],
};
