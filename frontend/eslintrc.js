/**
 * Configuración ESLint - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Configuración optimizada para React + TypeScript + Vite
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  
  ignorePatterns: [
    'dist',
    'build',
    'coverage',
    'node_modules',
    '.eslintrc.js',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
  ],
  
  parser: '@typescript-eslint/parser',
  
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
  
  plugins: [
    'react-refresh',
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  
  settings: {
    react: {
      version: 'detect',
    },
  },
  
  rules: {
    // =======================================================
    // REGLAS GENERALES
    // =======================================================
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Usar la regla de TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'eol-last': ['error', 'always'],
    'comma-dangle': ['error', 'es5'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'indent': ['error', 2, { SwitchCase: 1 }],
    
    // =======================================================
    // REGLAS TYPESCRIPT
    // =======================================================
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': false,
      },
    ],
    
    // =======================================================
    // REGLAS REACT
    // =======================================================
    'react/react-in-jsx-scope': 'off', // No necesario con nuevo JSX transform
    'react/prop-types': 'off', // Usamos TypeScript
    'react/display-name': 'warn',
    'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/self-closing-comp': ['error', { component: true, html: true }],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true,
      },
    ],
    
    // =======================================================
    // REGLAS REACT HOOKS
    // =======================================================
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // =======================================================
    // REGLAS REACT REFRESH (VITE)
    // =======================================================
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // =======================================================
    // REGLAS ESPECÍFICAS PARA FELICITAFAC
    // =======================================================
    
    // Nomenclatura en español para el proyecto
    'camelcase': [
      'warn',
      {
        properties: 'never',
        ignoreDestructuring: true,
        ignoreImports: true,
        allow: [
          // Permitir nombres en español comunes en el proyecto
          'razon_social',
          'numero_documento',
          'tipo_documento',
          'fecha_emision',
          'fecha_vencimiento',
          'tipo_cambio',
          'forma_pago',
          'estado_sunat',
          'codigo_hash',
          'nombre_comercial',
          'direccion_fiscal',
          'ubigeo_cliente',
          'email_cliente',
          'telefono_cliente',
          // Variables de entorno
          'VITE_API_URL',
          'VITE_APP_VERSION',
          'VITE_BUILD_TIME',
        ],
      },
    ],
    
    // Prevenir importaciones absolutas innecesarias
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*'],
            message: 'Usar alias @/* en lugar de imports relativos hacia arriba',
          },
        ],
      },
    ],
  },
  
  // =======================================================
  // CONFIGURACIÓN POR ARCHIVOS ESPECÍFICOS
  // =======================================================
  overrides: [
    // Configuración para archivos de configuración
    {
      files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
      },
    },
    
    // Configuración para archivos de prueba
    {
      files: ['**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}'],
      env: {
        jest: true,
        'vitest-globals/env': true,
      },
      extends: ['plugin:testing-library/react'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
      },
    },
    
    // Configuración para archivos de tipos
    {
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
      },
    },
    
    // Configuración para archivos de servicios API
    {
      files: ['src/servicios/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    
    // Configuración para componentes UI
    {
      files: ['src/componentes/ui/**/*.tsx'],
      rules: {
        'react/jsx-sort-props': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};