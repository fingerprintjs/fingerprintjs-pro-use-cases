import { IconButton, Tooltip } from '@mui/material';
import { FunctionComponent, PropsWithChildren } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Info: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <Tooltip title={children} enterTouchDelay={400}>
      <IconButton size='small' sx={{ padding: '2px' }}>
        <InfoOutlinedIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};

export default Info;
