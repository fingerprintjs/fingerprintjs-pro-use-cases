import Link from 'next/link';
import { FunctionComponent } from 'react';
import Image from 'next/image';
import BackArrowSvg from '../../../../client/img/arrowLeft.svg';
import styles from './BackArrow.module.scss';

type Props = {
  label: string;
  testId?: string;
} & ({ as: 'Link'; href: string } | { as: 'button'; onClick: () => void });

export const BackArrow: FunctionComponent<Props> = ({ label, testId, ...props }) => {
  const content = (
    <>
      <Image src={BackArrowSvg} alt='' className={styles.backArrow} />
      {label}
    </>
  );
  return (
    <div className={styles.buckButton} data-testid={testId}>
      {props.as === 'Link' && <Link href={props.href}>{content}</Link>}
      {props.as === 'button' && <div onClick={props.onClick}>{content}</div>}
    </div>
  );
};
