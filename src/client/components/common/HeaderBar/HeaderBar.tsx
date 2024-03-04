import React from 'react';
import Container from '../Container';

import styles from './HeaderBar.module.scss';
import { isLocalLink } from '../../../../shared/utils/link';
import Link from 'next/link';

export interface headerBarProps {
  children: React.ReactNode;
  linkUrl?: string;
  arrowText?: string;
  backgroundColor?: string;
}

export default function HeaderBar({ children, linkUrl, arrowText, backgroundColor }: headerBarProps) {
  return linkUrl ? (
    <Container style={{ backgroundColor: backgroundColor ?? '#20265a' }} className={styles.container} size='large'>
      <div className={styles.headerBar}>
        {isLocalLink(linkUrl) ? (
          <Link className={styles.link} href={linkUrl}>
            <div className={styles.text}>{children}</div>
            {arrowText && <div className={styles.arrow}>{arrowText} →</div>}
          </Link>
        ) : (
          <a className={styles.link} href={linkUrl} target='_blank' rel='noreferrer'>
            <div className={styles.text}>{children}</div>
            {arrowText && <div className={styles.arrow}>{arrowText} →</div>}
          </a>
        )}
      </div>
    </Container>
  ) : (
    <Container className={styles.container}>
      <span className={styles.text}>{children}</span>
    </Container>
  );
}
