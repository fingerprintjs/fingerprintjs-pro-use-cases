import Link from 'next/link';

import styles from './index.module.scss';
import Container from '../client/components/common/Container';
import { HOMEPAGE_CARDS } from '../client/components/common/content';
import LinkArrow from '../client/img/externalLinkArrow.svg';
import Image from 'next/image';
import { TEST_IDS } from '../client/e2eTestIDs';

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
          <Link className={styles.useCaseCard} href={card.url}>
            <div>
              <Image src={card.iconSvg} alt="" className={styles.useCaseIcon} />
              <h3 className={styles.useCaseTitle} data-test={TEST_IDS.homepageCard.useCaseTitle}>
                {card.title}
              </h3>
              <div className={styles.useCaseDescription}>{card.description}</div>
            </div>
            <div>
              <span className={styles.viewPrompt}>
                view use case demo
                <Image src={LinkArrow} alt="" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
