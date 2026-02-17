import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1B5E20',
                    light: '#2E7D32',
                    dark: '#1A4E1B',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#F57F17',
                    light: '#FBC02D',
                    dark: '#E65100',
                    foreground: '#FFFFFF',
                },
                info: {
                    DEFAULT: '#0D47A1',
                    light: '#1565C0',
                    bg: '#E3F2FD',
                },
                success: {
                    DEFAULT: '#2E7D32',
                    bg: '#E8F5E9',
                },
                warning: {
                    DEFAULT: '#F57F17',
                    bg: '#FFF8E1',
                },
                danger: {
                    DEFAULT: '#B71C1C',
                    bg: '#FFEBEE',
                },
                neutral: {
                    900: '#212121',
                    700: '#424242',
                    500: '#757575',
                    300: '#BDBDBD',
                    100: '#F5F5F5',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'slide-in': {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'slide-in': 'slide-in 0.3s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;
