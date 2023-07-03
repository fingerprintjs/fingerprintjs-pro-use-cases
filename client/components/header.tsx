import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { DarkMode, LightMode, Menu as MenuIcon, Settings } from '@mui/icons-material';
import { useUserPreferences } from '../api/personalization/use-user-preferences';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import { Logo } from './Logo';
import React from 'react';
import { Menu, MenuItem, Typography, useMediaQuery, useTheme } from '@mui/material';

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
                  : // @ts-ignore
                    theme.palette.getContrastText(theme.palette.header),
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

const CollapsedMenu = () => {
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
      <IconButton
        disableRipple
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MenuIcon sx={{ color: (t) => t.palette.primary.main }} />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        disableScrollLock={true}
      >
        {navLinks.map((link) => (
          <Link href={link.url} key={link.name}>
            <MenuItem onClick={handleClose} sx={{ a: { color: (t) => t.palette.text.primary } }}>
              <Typography
                sx={{
                  color: (theme) =>
                    router.pathname === link.url
                      ? theme.palette.primary.main
                      : // @ts-ignore
                        theme.palette.getContrastText(theme.palette.header),
                }}
              >
                {link.name}
              </Typography>
            </MenuItem>
          </Link>
        ))}
      </Menu>
    </div>
  );
};

export default function Header() {
  const { updateUserPreferences, hasDarkMode } = useUserPreferences();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1248));
  
  // const { query } = useRouter();
  // if (query.embed !== undefined) {
  //   return null;
  // }

  return (
    <AppBar
      position="static"
      sx={{
        // @ts-ignore
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
            {isSmallScreen ? null : <FullMenu />}
          </Stack>
          <Stack direction="row" alignItems="center">
            {isSmallScreen ? <CollapsedMenu /> : null}
            <IconButton disableRipple LinkComponent={Link} href="/admin">
              <Settings />
            </IconButton>
            <IconButton
              className="DarkMode_toggle"
              data-checked={hasDarkMode.toString()}
              disableRipple
              onClick={() => {
                updateUserPreferences({
                  hasDarkMode: !hasDarkMode,
                });
              }}
            >
              {hasDarkMode ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
