/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Cairo', 'Inter', 'sans-serif'],
  			display: ['Cairo', 'system-ui', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace']
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			aman: {
          teal: '#0F766E',
          navy: '#1E3A8A',
          red: '#DC2626',
          amber: '#F59E0B'
        },
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			}
  		},
  		keyframes: {
  			'sos-pulse': {
  				'0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)' },
  				'50%': { transform: 'scale(1.05)', opacity: '0.9', boxShadow: '0 0 20px 10px rgba(220, 38, 38, 0)' }
  			},
  			'radar-ping': {
  				'0%': { transform: 'scale(0)', opacity: '1' },
  				'100%': { transform: 'scale(4)', opacity: '0' }
  			}
  		},
  		animation: {
  			'sos-pulse': 'sos-pulse 2s infinite',
  			'radar-ping': 'radar-ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}