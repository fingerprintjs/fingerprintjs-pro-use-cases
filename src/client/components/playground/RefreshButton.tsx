import { FunctionComponent } from 'react';
import { PLAYGROUND_TAG } from './playgroundTags';
import Button from '../common/Button/Button';
import { Spinner } from '../common/Spinner/Spinner';

const RefreshButton: FunctionComponent<{ loading: boolean; getAgentData: () => void; className?: string }> = ({
  loading,
  getAgentData,
  className,
}) => {
  return (
    <Button
      color="primary"
      outlined
      size="medium"
      onClick={() => getAgentData()}
      disabled={loading}
      data-testid={PLAYGROUND_TAG.refreshButton}
      className={className}
    >
      {loading ? (
        <div style={{ display: 'flex' }}>
          <div>Loading...</div> <Spinner sx={{ marginLeft: '10px' }} />
        </div>
      ) : (
        <>Analyze my browser again</>
      )}
    </Button>
  );
};

export default RefreshButton;
