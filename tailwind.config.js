/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // 通过 class 切换深色模式
  theme: {
    extend: {
      colors: {
        // 科技感主题色：青蓝/紫色渐变
        primary: {
          50: '#eef9ff',
          100: '#d8f1ff',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490'
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 211, 238, 0.35)',
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.35)'
      },
      backgroundImage: {
        'tech-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
};
