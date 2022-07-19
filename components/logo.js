import Image from 'next/image';
import { useTheme } from '@mui/material';

export function Logo(props) {
  const theme = useTheme();

  return (
    <Image
      src={`/logo_${theme.palette.mode === 'dark' ? 'light' : 'dark'}.svg`}
      height="100%"
      alt="Fingerprint logo"
      {...props}
    />
  );
}
