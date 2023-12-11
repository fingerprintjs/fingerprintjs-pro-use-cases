/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  plugins: ['react-hooks', 'prettier'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'prettier/prettier': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/no-unescaped-entities': 'off',
  },
  env: {
    es6: true,
  },
};
