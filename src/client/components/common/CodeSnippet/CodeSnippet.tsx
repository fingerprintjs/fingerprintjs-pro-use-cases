'use client';

import { CSSProperties, PropsWithChildren } from 'react';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import lightTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coy';
import styles from './CodeSnippet.module.scss';
import classnames from 'classnames';
import { MyScrollArea } from '../ScrollArea/ScrollArea';
import { MyCopyButton } from '../CopyButton/CopyButton';
import ReactJsonViewer from '@microlink/react-json-view';

export interface CodeSnippetProps {
  language: string;
  children: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  dataTestId?: string;
  collapsibleJSON?: boolean;
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
  collapsibleJSON = false,
}: PropsWithChildren<CodeSnippetProps>) {
  const PRISM_CUSTOM_STYLE: CSSProperties = {
    padding: '16px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '16px',
    overflow: 'auto',
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0',
  };
  const PRISM_CODE_TAG_PROPS = { style: { color: '#c92c2c', font: 'inherit' as const } };

  const theme = {
    keys: 'rgb(201, 44, 44)', // red
    stringValue: 'rgb(47, 156, 10)', // green
    // number, boolean
    codeValue: 'rgb(201, 44, 44)', // red
    brackets: 'rgb(95, 99, 100)', // dark gray
  };

  //   base00 - Default Background
  // base01 - Lighter Background (Used for status bars, line number and folding marks)
  // base02 - Selection Background
  // base03 - Comments, Invisibles, Line Highlighting
  // base04 - Dark Foreground (Used for status bars)
  // base05 - Default Foreground, Caret, Delimiters, Operators
  // base06 - Light Foreground (Not often used)
  // base07 - Light Background (Not often used)
  // base08 - Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
  // base09 - Integers, Boolean, Constants, XML Attributes, Markup Link Url
  // base0A - Classes, Markup Bold, Search Text Background
  // base0B - Strings, Inherited Class, Markup Code, Diff Inserted
  // base0C - Support, Regular Expressions, Escape Characters, Markup Quotes
  // base0D - Functions, Methods, Attribute IDs, Headings
  // base0E - Keywords, Storage, Selector, Markup Italic, Diff Changed
  // base0F - Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>

  return (
    <div className={styles.snippetContainer}>
      <div className={styles.copyButtonContainer}>
        <MyCopyButton contentToCopy={children} className={styles.copyButton} />
      </div>
      <MyScrollArea className={styles.scrollArea}>
        {collapsibleJSON ? (
          <div className={styles.reactJsonViewerWrapper}>
            <ReactJsonViewer
              src={children as Object}
              // theme='bright:inverted'
              theme={{
                base00: '#fff', // Default Background
                base01: '#fff', // Lighter Background (Used for status bars, line number and folding marks)
                base02: theme.brackets, // Selection Background
                base03: theme.brackets, // Comments, Invisibles, Line Highlighting
                base04: theme.brackets, // Dark Foreground (Used for status bars)
                base05: theme.brackets, // Default Foreground, Caret, Delimiters, Operators
                base06: '', // Light Foreground (Not often used)
                base07: theme.codeValue, // Light Background (Not often used)
                base08: '', // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
                base09: theme.stringValue, // Integers, Boolean, Constants, XML Attributes, Markup Link Url
                base0A: theme.codeValue, // Classes, Markup Bold, Search Text Background
                base0B: theme.codeValue, // Strings, Inherited Class, Markup Code, Diff Inserted
                base0C: theme.codeValue, // Array indexes in JSON, Support, Regular Expressions, Escape Characters, Markup Quotes
                base0D: theme.codeValue, // Functions, Methods, Attribute IDs, Headings
                base0E: theme.codeValue, // Keywords, Storage, Selector, Markup Italic, Diff Changed
                base0F: theme.codeValue, // Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>
              }}
              name={false}
              enableClipboard={false}
              displayDataTypes={false}
              displayObjectSize={false}
              collapseStringsAfterLength={40}
              collapsed={2}
              iconStyle='square'
              indentWidth={2}
            />
          </div>
        ) : (
          <PrismAsyncLight
            showLineNumbers={showLineNumbers}
            lineNumberStyle={PRISM_LINE_NUMBER_STYLE}
            wrapLines
            language={language}
            style={lightTheme}
            /** Must use this to override the default style, CSS alone does not work */
            customStyle={PRISM_CUSTOM_STYLE}
            codeTagProps={PRISM_CODE_TAG_PROPS}
            className={classnames(styles.snippet, className)}
            data-testid={dataTestId}
          >
            {children}
          </PrismAsyncLight>
        )}
      </MyScrollArea>
    </div>
  );
}
