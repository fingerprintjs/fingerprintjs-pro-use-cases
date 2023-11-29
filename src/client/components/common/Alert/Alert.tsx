import { FunctionComponent, PropsWithChildren } from 'react';
import { Severity } from '../../../../server/checkResult';
import SuccessIcon from './sucess.svg';
import ErrorIcon from './error.svg';
import WarningIcon from './warning.svg';
import styles from './alert.module.scss';
import Image from 'next/image';
import classNames from 'classnames';
import { TEST_IDS } from '../../../testIDs';

type AlertProps = {
  severity: Severity;
  className?: string;
  dataTestId?: string;
} & PropsWithChildren;

const STYLES_MAP: Record<Severity, keyof typeof styles> = {
  error: styles.error,
  warning: styles.warning,
  success: styles.success,
};

const ICON_MAP: Record<Severity, any> = {
  error: ErrorIcon,
  warning: WarningIcon,
  success: SuccessIcon,
};

const Alert: FunctionComponent<AlertProps> = ({ severity, children, className, dataTestId }) => {
  return (
    <div
      className={classNames(styles.alert, STYLES_MAP[severity], className)}
      data-testid={classNames(TEST_IDS.common.alert, dataTestId)}
      data-test-severity={severity}
    >
      <div className={styles.iconWrapper}>
        <Image src={ICON_MAP[severity]} alt="" />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Alert;
