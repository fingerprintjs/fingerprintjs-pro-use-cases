import { FunctionComponent } from 'react';
import styles from './RefreshButton.module.scss';
import classnames from 'classnames';
import { TEST_IDS } from '../../../client/testIDs';
import { RestartSvg } from '../../../client/img/RestartSvg';

export const RefreshButton: FunctionComponent<{ loading: boolean; getAgentData: () => void; className?: string }> = ({
  loading,
  getAgentData,
  className,
}) => {
  return (
    <button
      color='primary'
      onClick={() => getAgentData()}
      disabled={loading}
      data-testid={TEST_IDS.playground.refreshButton}
      className={classnames(styles.refreshButton, className, loading && styles.loading)}
    >
      <div>Analyze my browser again</div>
      <RestartSvg width={16} height={16} />
    </button>
  );
};
