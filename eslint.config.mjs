import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Known copy mistakes in user-facing text: string literals, template literals, and JSX text.
// `\s+` between words also matches JSX text wrapped across lines.
// A spell checker misses these because every word is a real word.
const BANNED_COPY = [
  { pattern: String.raw`\bGithub\b`, message: 'Write "GitHub".' },
  { pattern: String.raw`client-site`, message: 'Write "client-side".' },
  { pattern: String.raw`\b([a-z]+)\s+\1\b`, flags: 'i', message: 'Doubled word.' },
  { pattern: String.raw`\bthe\s+(this|that)\b`, flags: 'i', message: 'Drop "the" or "this"/"that".' },
  {
    pattern: String.raw`\bto\s+login\s+(with|using|again|from)\b`,
    flags: 'i',
    message: 'Use "log in" as a verb; "login" is a noun.',
  },
  { pattern: String.raw`\byour\s+(currently|not|going)\b`, flags: 'i', message: 'Write "you\'re".' },
];

const bannedCopyRules = BANNED_COPY.map(({ pattern, flags = '', message }) => {
  const re = `/${pattern}/${flags}`;
  return {
    selector: `:matches(Literal[value=${re}], TemplateElement[value.cooked=${re}], JSXText[value=${re}])`,
    message: `Copy typo: ${message}`,
  };
});

// Two spaces between words. JSX text is skipped because its line breaks and indentation collapse when rendered.
const doubleSpaceRule = {
  selector: String.raw`:matches(Literal[value=/\S  +\S/], TemplateElement[value.cooked=/\S  +\S/])`,
  message: 'Copy typo: double space between words.',
};

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
        ...bannedCopyRules,
        doubleSpaceRule,
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
