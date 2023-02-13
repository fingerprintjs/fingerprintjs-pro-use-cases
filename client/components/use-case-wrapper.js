import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowBack } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

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
            {description && <p className="UsecaseWrapper_helper">{description}</p>}
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
                  <a href={articleURL} target="_blank" rel="noreferrer">
                    {title}
                  </a>{' '}
                  article.
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
