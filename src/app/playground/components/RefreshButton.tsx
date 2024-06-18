import { FunctionComponent } from 'react';
import Button from '../../../client/components/common/Button/Button';
import styles from './RefreshButton.module.scss';
import classnames from 'classnames';
import { TEST_IDS } from '../../../client/testIDs';
import Restart from '../../../client/img/restart.svg';
import Image from 'next/image';

const RefreshButton: FunctionComponent<{ loading: boolean; getAgentData: () => void; className?: string }> = ({
  loading,
  getAgentData,
  className,
}) => {
  return (
    <Button
      color='primary'
      outlined
      size='large'
      onClick={() => getAgentData()}
      disabled={loading}
      data-testid={TEST_IDS.playground.refreshButton}
      className={classnames(styles.refreshButton, className, loading && styles.loading)}
    >
      <>
        Analyze my browser again <Image src={Restart} width={18} height={18} alt='Analyze my browser again' />
      </>
    </Button>
  );
};

export default RefreshButton;
