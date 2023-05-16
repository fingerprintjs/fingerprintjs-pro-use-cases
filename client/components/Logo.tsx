import Image from 'next/image';
import { useTheme } from '@mui/material';
import { ComponentProps } from 'react';

export function Logo(props: ComponentProps<typeof Image>) {
  const theme = useTheme();

  return (
    <Image src={`/logo_${theme.palette.mode === 'dark' ? 'light' : 'dark'}.svg`} alt="Fingerprint logo" {...props} />
  );
}
