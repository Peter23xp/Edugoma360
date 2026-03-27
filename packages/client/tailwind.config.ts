import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        screens: {
            xs: '480px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1B5E20',
                    hover: '#2E7D32',
                    light: '#4CAF50',
                    lighter: '#E8F5E9',
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#F57F17',
                    hover: '#FF8F00',
                    light: '#FFF3E0',
                    foreground: '#FFFFFF',
                },
                info: {
                    DEFAULT: '#0D47A1',
                    hover: '#1565C0',
                    light: '#E3F2FD',
                },
                success: {
                    DEFAULT: '#1B5E20',
                    light: '#E8F5E9',
                },
                warning: {
                    DEFAULT: '#F57F17',
                    light: '#FFF3E0',
                },
                error: {
                    DEFAULT: '#C62828',
                    hover: '#D32F2F',
                    light: '#FFEBEE',
                },
                neutral: {
                    900: '#212121',
                    700: '#757575',
                    500: '#9E9E9E',
                    300: '#BDBDBD',
                    100: '#F5F5F5',
                    50: '#FAFAFA',
                },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--primary)',
                background: 'var(--background)',
                foreground: 'var(--text-primary)',
                destructive: {
                    DEFAULT: '#C62828',
                    foreground: '#FFFFFF',
                },
                muted: {
                    DEFAULT: '#F5F5F5',
                    foreground: '#757575',
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
