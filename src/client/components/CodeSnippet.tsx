import { PropsWithChildren } from 'react';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import lightTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coy';
import darkTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coldark-dark';

export interface CodeSnippetProps {
  language: string;
  children: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  dataTestId?: string;
}

const PRISM_LINE_NUMBER_STYLE = { minWidth: 28 };

/**
 * Provides a syntax-highlighted code block
 */
export function CodeSnippet({
  language,
  showLineNumbers,
  className,
  children,
  dataTestId,
}: PropsWithChildren<CodeSnippetProps>) {
  const hasDarkMode = false;

  const PRISM_CUSTOM_STYLE = {
    backgroundColor: hasDarkMode ? undefined : '#F5F5F5',
    padding: '12px',
    borderRadius: '4px',
    fontFamily: 'Roboto Mono, monospace',
    fontSize: '14px',
    margin: '0',
    overflow: 'auto',
    border: hasDarkMode ? '1px solid #333' : undefined,
  };
  const PRISM_CODE_TAG_PROPS = { style: { color: '#c92c2c', font: 'inherit' as const } };

  return (
    <PrismAsyncLight
      showLineNumbers={showLineNumbers}
      lineNumberStyle={PRISM_LINE_NUMBER_STYLE}
      wrapLines
      language={language}
      style={hasDarkMode ? darkTheme : lightTheme}
      customStyle={PRISM_CUSTOM_STYLE}
      codeTagProps={PRISM_CODE_TAG_PROPS}
      className={className}
      data-testid={dataTestId}
    >
      {children}
    </PrismAsyncLight>
  );
}
