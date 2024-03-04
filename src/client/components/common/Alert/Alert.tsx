import { FunctionComponent, PropsWithChildren } from 'react';
import { Severity } from '../../../../server/checkResult';
import SuccessIcon from './sucess.svg';
import ErrorIcon from './error.svg';
import WarningIcon from './warning.svg';
import InfoIcon from '../../../../client/img/InfoIcon.svg';
import styles from './alert.module.scss';
import Image from 'next/image';
import classNames from 'classnames';
import { TEST_IDS } from '../../../testIDs';
import { CustomContentProps, VariantType, useSnackbar, SnackbarKey } from 'notistack';
import React from 'react';
import Button from '../Button/Button';
import { CrossIconSvg } from '../../../img/crossIconSvg';

type AlertProps = {
  severity: Severity;
  className?: string;
  dataTestId?: string;
} & PropsWithChildren;

const STYLES_MAP: Record<VariantType, keyof typeof styles> = {
  error: styles.error,
  warning: styles.warning,
  success: styles.success,
  default: styles.info,
  info: styles.info,
};

export const ALERT_ICON_MAP: Record<VariantType, any> = {
  error: <Image src={ErrorIcon} alt='' />,
  warning: <Image src={WarningIcon} alt='' />,
  success: <Image src={SuccessIcon} alt='' />,
  default: <Image src={InfoIcon} alt='' />,
  info: <Image src={InfoIcon} alt='' width={24} height={24} style={{ padding: '2px' }} />,
};

/**
 * Static on-page alert/notification
 */
export const Alert: FunctionComponent<AlertProps> = ({ severity, children, className, dataTestId }) => {
  return (
    <div
      className={classNames(styles.alert, STYLES_MAP[severity], className)}
      data-testid={classNames(TEST_IDS.common.alert, dataTestId)}
      data-test-severity={severity}
    >
      <div className={styles.iconWrapper}>{ALERT_ICON_MAP[severity]}</div>
      <div>{children}</div>
    </div>
  );
};

/**
 * Custom `notistack` snackbar/popup (visually similar to the static alert above, but a separate component)
 */
export const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const {
    // You have access to notistack props and options 👇🏼
    id,
    action,
    message,
    variant,
    className,
    ...other
  } = props;

  return (
    <div
      ref={ref}
      role='alert'
      className={classNames(styles.snackbar, styles.withBorder, STYLES_MAP[variant], className)}
      {...other}
    >
      <div className={styles.snackbarContent}>
        <div className={styles.iconWrapper}>{ALERT_ICON_MAP[variant]}</div>
        <div className={styles.message}>{message}</div>
      </div>
      <div className={styles.snackbarActions}>{typeof action === 'function' ? action(id) : action}</div>
    </div>
  );
});

CustomSnackbar.displayName = 'CustomSnackbar';

export function CloseSnackbarButton({ snackbarId }: { snackbarId: SnackbarKey }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <>
      <div className={styles.closeIcon}>
        <CrossIconSvg onClick={() => closeSnackbar(snackbarId)} />
      </div>
      <Button
        onClick={() => closeSnackbar(snackbarId)}
        className={styles.closeButton}
        variant='ghost'
        outlined
        size='small'
      >
        CLOSE
      </Button>
    </>
  );
}
