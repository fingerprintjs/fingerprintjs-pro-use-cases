import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useUserPreferences } from '../../shared/client/api/use-user-preferences';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';

const navLinks = [
  {
    name: 'Credential Stuffing',
    url: '/credential-stuffing',
  },
  {
    name: 'Payment Fraud',
    url: '/payment-fraud',
  },
  {
    name: 'Personalization',
    url: '/personalization',
  },
];

export function Header({ addonRight }) {
  const { update, hasDarkMode } = useUserPreferences();
  const router = useRouter();

  return (
    <AppBar
      position="static"
      height={300}
      sx={{
        backgroundColor: (theme) => theme.palette.header,
      }}
    >
      <Toolbar>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Link href="/pages">
              <a>
                <Image src="/logo.svg" width={300} height="100%" alt="Fingerprint logo" />
              </a>
            </Link>
            {navLinks.map((link) => (
              <Link href={link.url} key={link.name} passHref>
                <Button
                  sx={(theme) => ({
                    color:
                      router.pathname === link.url
                        ? theme.palette.primary.main
                        : theme.palette.getContrastText(theme.palette.header),

                    [theme.breakpoints.down('md')]: {
                      display: 'none',
                    },
                  })}
                  component="a"
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton
              disableRipple
              onClick={() => {
                update({
                  hasDarkMode: !hasDarkMode,
                });
              }}
            >
              {hasDarkMode ? <DarkMode color="primary" /> : <LightMode color="primary" />}
            </IconButton>
            {addonRight}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
