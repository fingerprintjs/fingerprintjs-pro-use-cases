import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowBack } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';

/**
 * @typedef {Object} UseCaseWrapperProps
 * @property {string} title
 * @property {React.ReactNode} description
 * @property {string} [articleURL]
 * @property {Array<React.ReactNode>} [listItems]
 * @property {React.ReactNode} children
 * @property {string} [variant] - Variant of the InfoCard
 * @property {boolean} [hideSrcListItem=false] - Flag to hide the source list item
 * @property {boolean} [hideDivider=false] - Flag to hide the divider
 * @property {Object} [sx]
 * @property {string} [returnUrl]
 */

/**
 * @param {UseCaseWrapperProps} props
 * @returns {JSX.Element}
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
  returnUrl,
}) {
  return (
    <Paper variant="outlined" className="ExternalLayout_wrapper" square sx={sx}>
      <div className="ExternalLayout_main">
        <div className={clsx('UsecaseWrapper_wrapper', { full: variant === 'full' })}>
          <div className="UsecaseWrapper_description">
            <Stack direction="row" alignItems="baseline" spacing={1}>
              {returnUrl && (
                <Link href={returnUrl} legacyBehavior passHref>
                  <Tooltip title="Go back">
                    <IconButton component="a">
                      <ArrowBack />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
              <Typography
                component="h1"
                variant="h3"
                className="UsecaseWrapper_title"
                sx={{
                  pt: (t) => t.spacing(2),
                }}
              >
                {title}
              </Typography>
            </Stack>
            {description && <div className="UsecaseWrapper_helper">{description}</div>}
            {!hideDivider && <Divider className="UsecaseWrapper_divider" />}
            <ul className="UsecaseWrapper_notes">
              {listItems?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              <li>
                You can reset this scenario on the <Link href="/admin">Admin page</Link>.
              </li>
              {articleURL && (
                <li>
                  Learn more about this scenario in the{' '}
                  <a href={articleURL} target="_blank" rel="noreferrer">
                    {title}
                  </a>{' '}
                  article.
                </li>
              )}
              {!hideSrcListItem && (
                <li>
                  See the source code for this and other use cases{' '}
                  <a
                    href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases"
                    target="_blank"
                    rel="noreferrer"
                  >
                    on Github <GitHubIcon fontSize="small" className="" />
                  </a>
                  .
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
