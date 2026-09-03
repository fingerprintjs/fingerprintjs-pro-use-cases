import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      'react/no-unescaped-entities': 'off',
      // eslint-plugin-react-hooks v7 (via eslint-config-next 16) is stricter than v4.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.scratchpad/**', 'eslint.config.mjs', '.prettierrc.js']),
]);

export default eslintConfig;
