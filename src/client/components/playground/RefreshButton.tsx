import { FunctionComponent } from 'react';
import { PLAYGROUND_TAG } from './playgroundTags';
import Button from '../common/Button/Button';
import { Spinner } from '../common/Spinner/Spinner';
import styles from './RefreshButton.module.scss';
import classnames from 'classnames';

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
      className={classnames(styles.refreshButton, className)}
    >
      {loading ? (
        <div>
          <div>Loading</div> <Spinner />
        </div>
      ) : (
        <>Analyze my browser again</>
      )}
    </Button>
  );
};

export default RefreshButton;
