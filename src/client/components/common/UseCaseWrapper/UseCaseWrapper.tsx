import Divider from '@mui/material/Divider';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowBack, StyleSharp } from '@mui/icons-material';
import { Box, Paper, Tooltip, List, ListItem } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { FunctionComponent } from 'react';
import Container from '../Container';
import styles from './UseCaseWrapper.module.scss';
import Button from '../Button';
import Lightbulb from './lightbulb.svg';
import Image from 'next/image';

type UseCaseWrapperProps = {
  title: string;
  description?: React.ReactNode;
  articleURL?: string;
  listItems?: React.ReactNode[];
  children: React.ReactNode;
  hideSrcListItem?: boolean;
  hideDivider?: boolean;
  showAdminLink?: boolean;
  returnUrl?: string;
  contentSx?: React.CSSProperties;
};

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

export const UseCaseWrapper: FunctionComponent<UseCaseWrapperProps> = ({
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
}) => {
  return (
    <>
      <Container size="large">
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>{description}</div>
        {listItems?.length > 0 && (
          <div className={styles.howToUse}>
            <div>
              <h2>How to use this demo</h2>
              <ol>
                {listItems?.map((item, index) => (
                  <li key={index}>
                    {/* The wrapper div here is necessary for styles to work. */}
                    <div>{item}</div>
                  </li>
                ))}
                {showAdminLink && (
                  <li>
                    <div>
                      You can reset this scenario using the <b>Restart</b> button on the top right.
                    </div>
                  </li>
                )}
                {articleURL && (
                  <li>
                    <div>
                      Learn more about this scenario in the{' '}
                      <a href={articleURL} target="_blank" rel="noreferrer">
                        {title}
                      </a>{' '}
                      article.
                    </div>
                  </li>
                )}
                {!hideSrcListItem && (
                  <li>
                    <div>
                      See the source code for this and other use cases{' '}
                      <a
                        href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases"
                        target="_blank"
                        rel="noreferrer"
                      >
                        on GitHub
                      </a>
                      .
                    </div>
                  </li>
                )}
              </ol>
            </div>
            <div>
              <Button
                href={'https://dashboard.fingerprint.com/login'}
                size="large"
                outlined
                openNewTab
                className={styles.resourcesButton}
                buttonId="log-in-top-nav"
              >
                <Image src={Lightbulb} alt="Lightbulb" />
                See related resources
              </Button>
            </div>
          </div>
        )}

        <Paper
          sx={{
            padding: (theme) => theme.spacing(4),
            maxWidth: '600px',
            margin: '64px auto ',
            ...contentSx,
          }}
        >
          {children}
        </Paper>
      </Container>
      {/* <Box
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
      </Paper> */}
    </>
  );
};
