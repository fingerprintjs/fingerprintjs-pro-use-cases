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
import { SnackbarContent, CustomContentProps, VariantType } from 'notistack';
import React from 'react';

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

const BORDER_MAP: Record<VariantType, string> = {
  error: styles.errorBorder,
  warning: styles.warningBorder,
  success: styles.successBorder,
  default: styles.infoBorder,
  info: styles.infoBorder,
};

export const ALERT_ICON_MAP: Record<VariantType, any> = {
  error: <Image src={ErrorIcon} alt="" />,
  warning: <Image src={WarningIcon} alt="" />,
  success: <Image src={SuccessIcon} alt="" />,
  default: <Image src={InfoIcon} alt="" />,
  info: <Image src={InfoIcon} alt="" />,
};

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

interface CustomSnackbarProps extends CustomContentProps {
  //   allowDownload: boolean;
}

export const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomSnackbarProps>((props, ref) => {
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
    <SnackbarContent
      ref={ref}
      role="alert"
      className={classNames(styles.snackbar, STYLES_MAP[variant], BORDER_MAP[variant], className)}
      {...other}
    >
      <div className={styles.iconWrapper}>{ALERT_ICON_MAP[variant]}</div>
      {message}
    </SnackbarContent>
  );
});

CustomSnackbar.displayName = 'CustomSnackbar';
