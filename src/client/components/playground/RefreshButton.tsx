import { FunctionComponent } from 'react';
import { PLAYGROUND_TAG } from './playgroundTags';
import Button from '../common/Button/Button';

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
      {loading ? <>Loading... ⏳</> : <>Analyze my browser again</>}
    </Button>
  );
};

export default RefreshButton;
