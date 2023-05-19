import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowForward } from '@mui/icons-material';
import {Stack} from '@mui/material';

export type PageTileProps = {
  title: string;
  url: string;
  icon: ReactNode;
  description: string;
};

export const TILE_TAG = {
  useCaseTitle: 'useCaseTitle',
} as const;

export function PageTile({ url, title, icon, description }: PageTileProps) {
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
            xs: theme.spacing(2),
            md: theme.spacing(3),
          },
          display: 'flex',
          flexDirection: 'column',

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
        <Stack direction={"row"} alignItems={"center"} marginBottom={2}>
          <div className="Usecase_Icon">{icon}</div>
          <Typography
            className="Usecase_PageTitle"
            variant="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              marginLeft: (theme) => theme.spacing(1),
            }}
            data-test={TILE_TAG.useCaseTitle}
          >
            {title}
          </Typography>
        </Stack>
        <Typography whiteSpace="pre-line" sx={{ marginBottom: (theme) => theme.spacing(1) }}>
          {description}
        </Typography>
        <Button
          className="Usecase_LearnMore"
          sx={{
            visibility: 'hidden',
            opacity: 0,
            transition: (theme) => theme.transitions.create('opacity'),
            alignSelf: 'flex-end',
            marginTop: 'auto',
          }}
          endIcon={<ArrowForward />}
          color="primary"
        >
          View use case
        </Button>
      </Paper>
    </Link>
  );
}
