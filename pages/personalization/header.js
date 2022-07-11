import Image from 'next/image';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { ShoppingCart } from '@mui/icons-material';
import Badge from '@mui/material/Badge';

export function Header() {
  return (
    <AppBar color="secondary" position="static" height={300}>
      <Toolbar>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Image src="/logo.svg" width={300} height="100%" alt="Fingerprint logo" />
            <Typography variant="subtitle1">Coffee Shop</Typography>
          </Stack>
          <IconButton disableRipple color="primary" aria-label="Cart">
            <Badge badgeContent={4} color="info">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
