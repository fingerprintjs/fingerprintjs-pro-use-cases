import { FunctionComponent } from 'react';
import styles from './Spinner.module.scss';
import { SpinnerSvg } from '../../img/SpinnerSvg';
import classNames from 'classnames';

export const Spinner: FunctionComponent<{
  size: number;
  className?: string;
}> = ({ size, className }) => (
  <SpinnerSvg className={classNames(styles.spinner, className)} width={size} height={size} />
);
