// @ts-check
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowBack } from '@mui/icons-material';
import { Box, Paper, Tooltip, List, ListItem } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

/**
 * @typedef {Object} UseCaseWrapperProps
 * @property {string} title
 * @property {React.ReactNode} description
 * @property {string} [articleURL]
 * @property {Array<React.ReactNode>} [listItems]
 * @property {React.ReactNode} children
 * @property {boolean} [hideSrcListItem=false] - Flag to hide the source list item
 * @property {boolean} [hideDivider=false] - Flag to hide the divider
 * @property {boolean} [showAdminLink=true] - Flag to show the admin link
 * @property {Object} [contentSx] - Additional styles or style overrides for the main content <Paper> container
 * @property {string} [returnUrl]
 */

const MyListItem = ({ children, ...props }) => (
  <ListItem
    sx={{
      listStyleType: 'disc',
      display: 'list-item',
      padding: (theme) => theme.spacing(1, 0, 0, 0),
    }}
    {...props}
  >
    {children}
  </ListItem>
);

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
  hideSrcListItem = false,
  hideDivider = false,
  showAdminLink = true,
  returnUrl,
  contentSx,
}) {
  return (
    <>
      <Box
        sx={{
          padding: (theme) => theme.spacing(4),
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="baseline" spacing={1} justifyContent="center">
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
            variant="h1"
            sx={{
              textAlign: 'center',
              pt: (t) => t.spacing(2),
            }}
          >
            {title}
          </Typography>
        </Stack>
        {description && (
          <Box
            sx={{
              marginBottom: (t) => t.spacing(2),
              // @ts-ignore
              color: (t) => t.palette.gray,
            }}
          >
            {description}
          </Box>
        )}
        {!hideDivider && <Divider sx={{ width: '100%' }} />}

        <List sx={{ lineHeight: '1rem', fontSize: '0.85rem', paddingLeft: '40px' }}>
          {listItems?.map((item, index) => (
            <MyListItem key={index}>{item}</MyListItem>
          ))}
          {showAdminLink && (
            <MyListItem>
              You can reset this scenario on the <Link href="/admin">Admin page</Link>.
            </MyListItem>
          )}
          {articleURL && (
            <MyListItem>
              Learn more about this scenario in the{' '}
              <a href={articleURL} target="_blank" rel="noreferrer">
                {title}
              </a>{' '}
              article.
            </MyListItem>
          )}
          {!hideSrcListItem && (
            <MyListItem>
              See the source code for this and other use cases{' '}
              <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases" target="_blank" rel="noreferrer">
                on Github <GitHubIcon fontSize="small" />
              </a>
              .
            </MyListItem>
          )}
        </List>
      </Box>
      <Paper
        sx={{
          padding: (theme) => theme.spacing(4),
          maxWidth: '600px',
          margin: '0 auto ',
          ...contentSx,
        }}
      >
        {children}
      </Paper>
    </>
  );
}
