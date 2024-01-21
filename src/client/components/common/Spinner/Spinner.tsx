import CircularProgress from '@mui/material/CircularProgress';
import { FunctionComponent } from 'react';

export const Spinner: FunctionComponent<{ sx?: React.CSSProperties }> = ({ sx }) => (
  <CircularProgress size={'18px'} thickness={5} sx={{ height: '18px', ...sx }} />
);
