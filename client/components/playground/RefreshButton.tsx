import { Button, CircularProgress } from '@mui/material';
import { FunctionComponent } from 'react';

const RefreshButton: FunctionComponent<{ loading: boolean; getAgentData: Function }> = ({ loading, getAgentData }) => {
  return (
    <Button
      color="primary"
      variant="outlined"
      sx={{ mr: 'auto', ml: 'auto', mt: (t) => t.spacing(4), mb: (t) => t.spacing(8), display: 'flex' }}
      onClick={() => getAgentData()}
      disabled={loading}
    >
      {loading ? (
        <>
          Loading...
          <CircularProgress size={'1rem'} thickness={5} sx={{ ml: (t) => t.spacing(2) }} />
        </>
      ) : (
        <>Analyze my browser again</>
      )}
    </Button>
  );
};

export default RefreshButton;
