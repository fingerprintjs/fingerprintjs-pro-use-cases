import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import { FunctionComponent } from 'react';

export const Spinner: FunctionComponent<{
  size?: CircularProgressProps['size'];
  thickness?: CircularProgressProps['thickness'];
  sx?: React.CSSProperties;
}> = ({ sx, size, thickness }) => <CircularProgress size={size ?? '18px'} thickness={thickness ?? 5} sx={{ ...sx }} />;
