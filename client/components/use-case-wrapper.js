import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import React from 'react';

/**
 * @typedef {Object} UseCaseWrapperProps
 * @property {string} title 
 * @property {React.ReactNode} description
 * @property {string} articleURL
 * @property {Array<React.ReactNode>} listItems
 * @property {Array<React.ReactNode>} children
 * @property {string} [variant] - Variant of the InfoCard
 * @property {boolean} [hideSrcListItem=false] - Flag to hide the source list item
 * @property {boolean} [hideDivider=false] - Flag to hide the divider
 * @property {Object} [sx] - Styled-components sx prop
 */

/**
 * InfoCard component
 * @param {UseCaseWrapperProps} props - Props for the component
 * @returns {JSX.Element} React component
 */
export function UseCaseWrapper({
  title,
  description,
  articleURL,
  listItems,
  children,
  variant,
  hideSrcListItem = false,
  hideDivider = false,
  sx,
}) {
  return (
    <Paper variant="outlined" className="ExternalLayout_wrapper" square sx={sx}>
      <div className="ExternalLayout_main">
        <div className={clsx('UsecaseWrapper_wrapper', { full: variant === 'full' })}>
          <div className="UsecaseWrapper_description">
            <h1 className="UsecaseWrapper_title">{title}</h1>
            <p className="UsecaseWrapper_helper">{description}</p>
            {!hideDivider && <Divider className="UsecaseWrapper_divider" />}
            <ul className="UsecaseWrapper_notes">
              {listItems?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              <li>
                You can reset this scenario on the <Link href="/admin">admin page</Link>.
              </li>
              {articleURL && (
                <li>
                  Learn more about this scenario in the{' '}
                  <a
                  href={articleURL}
                  target="_blank"
                  rel="noreferrer"
                  >
                    {title}
                  </a>
                  {' '}article.
                </li>
              )}
              {!hideSrcListItem && (
                <li>
                  Need src?{' '}
                  <a
                    href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Sure!
                  </a>
                </li>
              )}
            </ul>
          </div>
          <Paper
            className="UsecaseWrapper_content"
            variant="elevation"
            sx={{
              padding: (theme) => theme.spacing(4),
            }}
          >
            {children}
          </Paper>
        </div>
      </div>
    </Paper>
  );
}
