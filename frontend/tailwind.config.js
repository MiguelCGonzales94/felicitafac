/**
 * Configuración de Tailwind CSS - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Configuración personalizada con tema y utilidades específicas
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colores personalizados del sistema
      colors: {
        // Paleta principal de FELICITAFAC
        felicitafac: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Color principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Colores para estados SUNAT
        sunat: {
          enviado: '#10b981',
          pendiente: '#f59e0b',
          error: '#ef4444',
          anulado: '#6b7280',
        },
        
        // Colores para roles de usuario
        roles: {
          administrador: '#8b5cf6',
          contador: '#06b6d4',
          vendedor: '#10b981',
          cliente: '#f59e0b',
        },
        
        // Colores para tipos de documento
        documentos: {
          factura: '#3b82f6',
          boleta: '#10b981',
          'nota-credito': '#f59e0b',
          'nota-debito': '#ef4444',
        },
        
        // Colores semánticos mejorados
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },

      // Tipografía personalizada
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },

      // Tamaños de fuente específicos
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      // Espaciado personalizado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // Anchos y alturas personalizados
      width: {
        '128': '32rem',
        '144': '36rem',
      },
      height: {
        '128': '32rem',
        '144': '36rem',
      },

      // Configuración de grid
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },

      // Configuración de z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-in-out',
        'slide-in-top': 'slideInTop 0.3s ease-in-out',
        'slide-in-bottom': 'slideInBottom 0.3s ease-in-out',
        'bounce-in': 'bounceIn 0.6s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },

      // Keyframes para animaciones
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
      },

      // Transiciones personalizadas
      transitionProperty: {
        'spacing': 'margin, padding',
      },

      // Sombras personalizadas
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-yellow': '0 0 20px rgba(245, 158, 11, 0.3)',
      },

      // Configuración de bordes redondeados
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },

      // Configuración de backdrop blur
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  
  plugins: [
    // Plugin para formularios
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    
    // Plugin para tipografía
    require('@tailwindcss/typography'),
    
    // Plugin para aspect ratio
    require('@tailwindcss/aspect-ratio'),
    
    // Plugin para container queries
    require('@tailwindcss/container-queries'),

    // Plugins personalizados
    function({ addUtilities, addComponents, theme }) {
      // Utilidades personalizadas
      addUtilities({
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0,0,0,0.10)',
        },
        '.text-shadow-md': {
          'text-shadow': '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 15px 30px rgba(0,0,0,0.11), 0 5px 15px rgba(0,0,0,0.08)',
        },
        '.text-shadow-none': {
          'text-shadow': 'none',
        },
        
        // Scrollbar personalizado
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.gray.400')} ${theme('colors.gray.200')}`,
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme('colors.gray.100'),
            borderRadius: theme('borderRadius.lg'),
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme('colors.gray.400'),
            borderRadius: theme('borderRadius.lg'),
            '&:hover': {
              backgroundColor: theme('colors.gray.500'),
            },
          },
        },
        
        // Gradientes personalizados
        '.gradient-felicitafac': {
          'background-image': `linear-gradient(to right, ${theme('colors.felicitafac.600')}, ${theme('colors.purple.600')})`,
        },
        '.gradient-success': {
          'background-image': `linear-gradient(to right, ${theme('colors.success.500')}, ${theme('colors.success.600')})`,
        },
        '.gradient-warning': {
          'background-image': `linear-gradient(to right, ${theme('colors.warning.500')}, ${theme('colors.warning.600')})`,
        },
        '.gradient-error': {
          'background-image': `linear-gradient(to right, ${theme('colors.error.500')}, ${theme('colors.error.600')})`,
        },
      });

      // Componentes personalizados
      addComponents({
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          cursor: 'pointer',
          transitionProperty: 'all',
          transitionDuration: theme('transitionDuration.200'),
          transitionTimingFunction: theme('transitionTimingFunction.in-out'),
          
          '&:focus': {
            outline: 'none',
            ringWidth: theme('ringWidth.2'),
            ringColor: theme('colors.felicitafac.500'),
            ringOffsetWidth: theme('ringOffsetWidth.2'),
          },
          
          '&:disabled': {
            opacity: theme('opacity.50'),
            cursor: 'not-allowed',
          },
        },
        
        '.btn-primary': {
          backgroundColor: theme('colors.felicitafac.600'),
          color: theme('colors.white'),
          
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.felicitafac.700'),
          },
          
          '&:active': {
            backgroundColor: theme('colors.felicitafac.800'),
          },
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.gray.100'),
          color: theme('colors.gray.900'),
          border: `1px solid ${theme('colors.gray.300')}`,
          
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.200'),
            borderColor: theme('colors.gray.400'),
          },
        },
        
        '.btn-success': {
          backgroundColor: theme('colors.success.600'),
          color: theme('colors.white'),
          
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.success.700'),
          },
        },
        
        '.btn-warning': {
          backgroundColor: theme('colors.warning.600'),
          color: theme('colors.white'),
          
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.warning.700'),
          },
        },
        
        '.btn-error': {
          backgroundColor: theme('colors.error.600'),
          color: theme('colors.white'),
          
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.error.700'),
          },
        },

        // Cards personalizadas
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.soft'),
          border: `1px solid ${theme('colors.gray.200')}`,
          overflow: 'hidden',
        },
        
        '.card-hover': {
          transitionProperty: 'all',
          transitionDuration: theme('transitionDuration.200'),
          
          '&:hover': {
            boxShadow: theme('boxShadow.medium'),
            borderColor: theme('colors.gray.300'),
          },
        },

        // Inputs personalizados
        '.input': {
          appearance: 'none',
          backgroundColor: theme('colors.white'),
          borderColor: theme('colors.gray.300'),
          borderWidth: theme('borderWidth.DEFAULT'),
          borderRadius: theme('borderRadius.lg'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          width: '100%',
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: theme('transitionDuration.200'),
          
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.felicitafac.500'),
            ringWidth: theme('ringWidth.1'),
            ringColor: theme('colors.felicitafac.500'),
          },
          
          '&::placeholder': {
            color: theme('colors.gray.400'),
          },
          
          '&:disabled': {
            backgroundColor: theme('colors.gray.50'),
            color: theme('colors.gray.500'),
            cursor: 'not-allowed',
          },
        },
      });
    },
  ],
};