import { useState } from 'react';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowForward } from '@mui/icons-material';

/** 
 * @typedef {Object} PageTileProps
 * @property {string} title
 * @property {string} url
 * @property {React.ReactNode} icon
 * @property {string} description
 */

/**
 * @param {PageTileProps} props 
 * @returns {JSX.Element}
 */
export function PageTile({ url, title, icon, description }) {
  const [elevation, setElevation] = useState(1);

  return (
    <Link key={url} href={url} passHref legacyBehavior>
      <Paper
        elevation={elevation}
        onMouseEnter={() => {
          setElevation(4);
        }}
        onMouseLeave={() => {
          setElevation(1);
        }}
        component="a"
        sx={(theme) => ({
          paddingX: theme.spacing(3),
          paddingTop: theme.spacing(3),
          paddingBottom: {
            xs: 0,
            md: theme.spacing(3),
          },
          display: 'block',
          position: 'relative',
          height: '100%',

          [theme.breakpoints.down('md')]: {
            textAlign: 'center',
          },

          '& .Usecase_PageTitle, & .Usecase_Icon': {
            transition: theme.transitions.create('color'),
          },

          '& .Usecase_Icon': {
            color: theme.palette.text.secondary,
          },

          '&:hover': {
            '& .Usecase_LearnMore': {
              opacity: 1,
              visibility: 'visible',
            },

            '& .Usecase_PageTitle': {
              color: theme.palette.primary.main,
            },

            '& .Usecase_Icon': {
              color: theme.palette.text.primary,
            },
          },
        })}
      >
        <Stack
          spacing={{
            xs: 6,
            md: 0,
          }}
          direction="column"
          sx={(theme) => ({
            height: '100%',
            justifyContent: 'space-between',

            [theme.breakpoints.down('md')]: {
              paddingBottom: theme.spacing(3),
            },
          })}
        >
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            alignItems={{
              xs: 'center',
              md: 'flex-start',
            }}
            spacing={3}
          >
            <span className="Usecase_Icon">{icon}</span>
            <Stack direction="column" spacing={3}>
              <Typography
                className="Usecase_PageTitle"
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                {title}
              </Typography>
              <Typography whiteSpace="pre-line">{description}</Typography>
            </Stack>
          </Stack>
          <Button
            className="Usecase_LearnMore"
            sx={{
              visibility: 'hidden',
              opacity: 0,
              transition: (theme) => theme.transitions.create('opacity'),
              alignSelf: 'flex-end',
            }}
            endIcon={<ArrowForward />}
            color="primary"
          >
            View use case
          </Button>
        </Stack>
      </Paper>
    </Link>
  );
}
