/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ORVIX Color System
        void:      '#050507',
        abyss:     '#080810',
        deep:      '#0c0c16',
        chamber:   '#10101c',
        shell:     '#161622',
        graphite:  '#20202e',
        iron:      '#2c2c3e',
        steel:     '#404058',
        fog:       '#5a5a78',
        mist:      '#7878a0',
        silver:    '#a0a0c0',
        ghost:     '#c8c8e0',
        ivory:     '#e8e4d8',

        // Accent palette
        gold: {
          DEFAULT: '#c8a050',
          light:   '#e0b860',
          pale:    '#f0d090',
        },
        crimson: {
          DEFAULT: '#a01828',
          blood:   '#c01e30',
          ember:   '#d84020',
        },
        amber:   '#c06018',
        coral:   '#e05040',
        jade:    '#186848',

        // Semantic
        success: '#22c55e',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },

      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Syne', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:   ['11px', { lineHeight: '16px' }],
        sm:   ['12px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md:   ['15px', { lineHeight: '22px' }],
        lg:   ['16px', { lineHeight: '24px' }],
        xl:   ['18px', { lineHeight: '26px' }],
        '2xl': ['20px', { lineHeight: '28px' }],
        '3xl': ['24px', { lineHeight: '32px' }],
        '4xl': ['30px', { lineHeight: '36px' }],
        '5xl': ['36px', { lineHeight: '42px' }],
        '6xl': ['48px', { lineHeight: '52px' }],
        '7xl': ['60px', { lineHeight: '64px' }],
        '8xl': ['72px', { lineHeight: '76px' }],
        '9xl': ['96px', { lineHeight: '100px' }],
        'display': ['120px', { lineHeight: '112px' }],
      },

      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '48': '192px',
        '56': '224px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
        '128': '512px',
      },

      borderRadius: {
        none: '0',
        sm:   '3px',
        DEFAULT: '5px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },

      boxShadow: {
        'glow-gold':    '0 0 24px rgba(200,160,80,0.3)',
        'glow-crimson': '0 0 24px rgba(192,30,48,0.3)',
        'glow-jade':    '0 0 24px rgba(24,104,72,0.3)',
        'card':         '0 4px 24px rgba(0,0,0,0.4)',
        'card-lg':      '0 20px 60px rgba(0,0,0,0.5)',
        'float':        '0 40px 80px rgba(0,0,0,0.6)',
      },

      backgroundImage: {
        'gradient-gold':    'linear-gradient(135deg, #c8a050, #e0b860)',
        'gradient-crimson': 'linear-gradient(135deg, #a01828, #d84020)',
        'gradient-void':    'linear-gradient(180deg, #050507, #080810)',
        'noise':            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")",
      },

      animation: {
        'fade-up':      'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fadeIn 0.6s ease forwards',
        'slide-right':  'slideRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':        'float 3s ease-in-out infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'progress':     'progress 2s ease-in-out infinite',
        'waveform':     'waveform 1.5s ease-in-out infinite alternate',
        'grain':        'grain 10s steps(8) infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        progress: {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' },
        },
        waveform: {
          from: { transform: 'scaleY(0.4)' },
          to:   { transform: 'scaleY(1)' },
        },
        grain: {
          '0%, 100%': { backgroundPosition: '0 0' },
          '25%':      { backgroundPosition: '-60px 80px' },
          '50%':      { backgroundPosition: '40px -60px' },
          '75%':      { backgroundPosition: '-30px 50px' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(192,30,48,0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(192,30,48,0.7)' },
        },
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
