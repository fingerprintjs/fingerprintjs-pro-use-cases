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
      // A variable first argument can replace the base: absolute URL, `//host`, or a backslash.
      // https://url.spec.whatwg.org/#url-parsing
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.name='URL'][arguments.length>=2][arguments.0.type!='Literal'], CallExpression[callee.object.name='URL'][callee.property.name='parse'][arguments.length>=2][arguments.0.type!='Literal']",
          message:
            'new URL(path, base) and URL.parse(path, base) ignore base when path is absolute or starts with // or a backslash. Build from a fixed origin and assign pathname and search, or append the path without parsing it.',
        },
      ],
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
