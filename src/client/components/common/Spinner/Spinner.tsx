import { FunctionComponent } from 'react';
import styles from './Spinner.module.scss';
import { SpinnerSvg } from '../../../img/SpinnerSvg';

export const Spinner: FunctionComponent<{
  size?: number;
}> = ({ size }) => <SpinnerSvg className={styles.spinner} width={size} height={size} />;
