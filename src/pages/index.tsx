import Link from 'next/link';

import styles from './index.module.scss';
import Container from '../client/components/common/Container';
import { HOMEPAGE_CARDS } from '../client/components/common/content';
import LinkArrow from '../client/img/externalLinkArrow.svg';
import Image from 'next/image';
import { TEST_IDS } from '../client/e2eTestIDs';
import { Fragment } from 'react';
import { HeadSEO } from '../client/components/common/HeadSEO';

export default function Index() {
  return (
    <>
      <HeadSEO
        title="Fingerprint Use Cases | Discover Device Intelligence Use Cases"
        description={`Explore an extensive range of use cases supported by Fingerprint, and learn how to successfully implement it for your 
        business with practical guidance and a comprehensive demo.`}
      />
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
          <Link className={styles.useCaseCard} href={card.url} key={card.url}>
            <div>
              <Image src={card.iconSvg} alt="" className={styles.useCaseIcon} />
              <h3 className={styles.useCaseTitle} data-test={TEST_IDS.homepageCard.useCaseTitle}>
                {card.title}
              </h3>
              <div className={styles.useCaseDescription}>
                {card.descriptionHomepage.map((line, i) => (
                  <Fragment key={i}>{line}</Fragment>
                ))}
              </div>
            </div>
            <div>
              <span className={styles.viewPrompt}>
                See use case demo
                <Image src={LinkArrow} alt="" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
