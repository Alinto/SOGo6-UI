import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import jestPlugin from 'eslint-plugin-jest'
import tseslint from 'typescript-eslint'
import nextIntlTranslationKey from './config/eslint-rules/next-intl-translation-key.js'

export default defineConfig([
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    files: ['src/**/*.{js,ts,jsx,tsx}'],
    ignores: ['src/**/__tests__/**', 'src/**/__mocks__/**'],
    plugins: {
      jest: jestPlugin,
      '@typescript-eslint': tseslint.plugin,
      custom: {
        rules: {
          'next-intl-translation-key': nextIntlTranslationKey,
        },
      },
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          ignoreProps: true,
        },
      ],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
])
