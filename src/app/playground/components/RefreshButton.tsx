import { FunctionComponent } from 'react';
import Button from '../../../client/components/common/Button/Button';
import { Spinner } from '../../../client/components/common/Spinner/Spinner';
import styles from './RefreshButton.module.scss';
import classnames from 'classnames';
import { TEST_IDS } from '../../../client/testIDs';

const RefreshButton: FunctionComponent<{ loading: boolean; getAgentData: () => void; className?: string }> = ({
  loading,
  getAgentData,
  className,
}) => {
  return (
    <Button
      color='primary'
      outlined
      size='medium'
      onClick={() => getAgentData()}
      disabled={loading}
      data-testid={TEST_IDS.playground.refreshButton}
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
