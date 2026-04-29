import js from '@eslint/js'
import react from 'eslint-plugin-react'

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  URL: 'readonly',
  IntersectionObserver: 'readonly',
  ResizeObserver: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly'
}

export default [
  js.configs.recommended,
  {
    files: [
      'common.js',
      'editor.js',
      'live.js',
    ],
    plugins: {
      react
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-eval': 'warn',
      'react/jsx-uses-vars': 'error',
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false
        }
      ]
    }
  }
]