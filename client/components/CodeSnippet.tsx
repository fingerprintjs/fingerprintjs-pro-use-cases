import { PropsWithChildren } from 'react';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import highlightTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coy';

export interface CodeSnippetProps {
  language: string;
  children: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

const PRISM_LINE_NUMBER_STYLE = { minWidth: 28 };
const PRISM_CUSTOM_STYLE = {
  backgroundColor: '#F5F5F5',
  padding: '12px',
  paddingRight: '30px', // copy button padding
  borderRadius: '4px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '14px',
  margin: '0',
  overflow: 'auto',
};
const PRISM_CODE_TAG_PROPS = { style: { color: '#c92c2c', font: 'inherit' as const } };

/**
 * Provides a syntax-highlighted code block
 */
export function CodeSnippet({ language, showLineNumbers, className, children }: PropsWithChildren<CodeSnippetProps>) {
  return (
    <PrismAsyncLight
      showLineNumbers={showLineNumbers}
      lineNumberStyle={PRISM_LINE_NUMBER_STYLE}
      wrapLines
      language={language}
      style={highlightTheme}
      customStyle={PRISM_CUSTOM_STYLE}
      codeTagProps={PRISM_CODE_TAG_PROPS}
      className={className}
    >
      {children}
    </PrismAsyncLight>
  );
}
