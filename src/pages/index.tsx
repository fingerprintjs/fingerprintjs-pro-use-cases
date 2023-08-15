import Link from 'next/link';
import {
  AirplaneTicket,
  Block,
  CreditScore,
  Money,
  People,
  PrecisionManufacturing,
  Settings,
  Fingerprint,
} from '@mui/icons-material';
import { PageTile, PageTileProps } from '../client/components/PageTile';
import { Box, Divider, Typography } from '@mui/material';

import styles from './index.module.scss';
import Container from '../client/components/common/Container';
import { HOMEPAGE_CARDS } from '../client/components/common/content';

export default function Index() {
  return (
    <>
      <Container size="large" className={styles.hero}>
        <h1 className={styles.title}>Fingerprint use cases</h1>
        <div className={styles.intro}>
          <p>
            Explore the wide range of major use cases supported by Fingerprint, including a comprehensive demo that
            showcases both frontend and backend sample implementations with a persistent data layer for each use case. 
          </p>

          <p>
            This provides insights and practical guidance on how to effectively implement Fingerprint for the specific
            use case that is most relevant to your business.
          </p>
        </div>
      </Container>
      <div className={styles.useCaseGrid}>
        {HOMEPAGE_CARDS.map((card) => (
          <div className={styles.useCaseCard}>
            <h4>{card.title}</h4>
            <div>{card.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}
