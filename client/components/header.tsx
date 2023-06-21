import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useUserPreferences } from '../api/personalization/use-user-preferences';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import { Logo } from './Logo';
import React from 'react';
import { Menu, MenuItem, Typography } from '@mui/material';

const navLinks = [
  {
    name: 'Playground',
    url: '/playground',
  },
  {
    name: 'Coupon Fraud',
    url: '/coupon-fraud',
  },
  {
    name: 'Credential Stuffing',
    url: '/credential-stuffing',
  },
  {
    name: 'Loan Risk',
    url: '/loan-risk',
  },
  {
    name: 'Payment Fraud',
    url: '/payment-fraud',
  },
  {
    name: 'Paywall',
    url: '/paywall',
  },
  {
    name: 'Personalization',
    url: '/personalization',
  },
  {
    name: 'Scraping',
    url: '/web-scraping',
  },
];

const FullMenu = () => {
  const router = useRouter();
  return (
    <>
      {navLinks.map((link) => (
        <Link href={link.url} key={link.name} passHref legacyBehavior>
          <Button
            size="small"
            sx={(theme) => ({
              color:
                router.pathname === link.url
                  ? theme.palette.primary.main
                  : theme.palette.getContrastText(theme.palette.header),
              [theme.breakpoints.down(1150)]: {
                display: 'none',
              },
              whiteSpace: 'nowrap',
            })}
            component="a"
          >
            {link.name}
          </Button>
        </Link>
      ))}
    </>
  );
};

function CollapsedMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Use cases
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {navLinks.map((link) => (
          <MenuItem compo onClick={handleClose} key={link.name} sx={{ a: { color: (t) => t.palette.text.primary } }}>
            <Link href={link.url}>
              <Typography
                sx={{
                  color: (theme) =>
                    router.pathname === link.url
                      ? theme.palette.primary.main
                      : theme.palette.getContrastText(theme.palette.header),
                }}
              >
                {link.name}
              </Typography>
            </Link>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export function Header() {
  const { update, hasDarkMode } = useUserPreferences();

  return (
    <AppBar
      position="static"
      // height={300}
      sx={{
        backgroundColor: (theme) => theme.palette.header,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Link href="/" style={{ display: 'flex', marginRight: '1.5rem' }}>
              <Logo width={170} height={30} />
            </Link>
            <FullMenu />
            <CollapsedMenu />
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton
              className="DarkMode_toggle"
              data-checked={hasDarkMode.toString()}
              disableRipple
              onClick={() => {
                update({
                  hasDarkMode: !hasDarkMode,
                });
              }}
            >
              {hasDarkMode ? <DarkMode color="primary" /> : <LightMode color="primary" />}
            </IconButton>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
