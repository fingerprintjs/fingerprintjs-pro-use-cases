import { ElementRef, FunctionComponent, useRef, useState } from 'react';
import Container from '../Container';
import styles from './UseCaseWrapper.module.scss';
import Button from '../Button/Button';
import Lightbulb from './lightbulb.svg';
import Image from 'next/image';
import { Tooltip } from '@mui/material';
import { UseCase } from '../content';
import ExternalLinkIcon from '../../../img/externalLinkArrow.svg';
import RestartIcon from '../../../img/restart.svg';
import { useReset } from '../../../hooks/useReset/useReset';
import classNames from 'classnames';
import { RestartHint } from './RestartHint';
import { SEO } from '../seo';
import { TEST_IDS } from '../../../testIDs';

export const INSTRUCTION_ANCHOR_ID = 'instructions';

type UseCaseWrapperProps = {
  useCase: Partial<UseCase>;
  children: React.ReactNode;
  hideGithubLink?: boolean;
  returnUrl?: string;
  embed?: boolean;
  instructionsNote?: string;
};

export const UseCaseWrapper: FunctionComponent<UseCaseWrapperProps> = ({
  children,
  hideGithubLink: hideSrcListItem = false,
  useCase,
  embed,
  instructionsNote,
}) => {
  const { title, description, articleUrl, instructions, moreResources, doNotMentionResetButton } = useCase ?? {};
  const learnMoreRef = useRef<ElementRef<'h3'>>(null);

  const { mutate, shouldDisplayResetButton, isLoading } = useReset({});
  const [pulseResetButton, setPulseResetButton] = useState(false);

  const moreResourcesPresent = moreResources && moreResources.length > 0;

  return (
    <>
      <SEO title={useCase.titleMeta ?? ''} description={useCase.descriptionMeta ?? ''} path={useCase.url} />
      {embed && shouldDisplayResetButton && (
        <Tooltip title='Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action.'>
          <div
            className={classNames([
              styles.floatyResetButton,
              isLoading && styles.loading,
              pulseResetButton && styles.pulse,
            ])}
            onClick={() => !isLoading && mutate()}
            data-testid={TEST_IDS.reset.resetButton}
          >
            <div className={styles.resetTitle}>Restart</div>
            <Image src={RestartIcon} alt='Reset scenario' />
          </div>
        </Tooltip>
      )}
      <Container size='large'>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>{description}</div>
        <div className={styles.externalLinks}>
          {!hideSrcListItem && (
            <a href='https://github.com/fingerprintjs/fingerprintjs-pro-use-cases' target='_blank' rel='noreferrer'>
              See on GitHub
              <Image src={ExternalLinkIcon} alt='' />
            </a>
          )}
          {articleUrl && (
            <a href={articleUrl} target='_blank' rel='noreferrer'>
              See technical tutorial
              <Image src={ExternalLinkIcon} alt='' />
            </a>
          )}
        </div>
        {instructions && instructions.length > 0 && (
          <div className={styles.howToUse} id={INSTRUCTION_ANCHOR_ID}>
            <div>
              <h2>How to use this demo</h2>
              <ol>
                {instructions?.map((item, index) => (
                  <li key={index}>
                    {/* The wrapper div here is necessary for styles to work. */}
                    <div>{typeof item === 'function' ? item({ setPulseResetButton }) : item}</div>
                  </li>
                ))}
                {!doNotMentionResetButton && (
                  <li>
                    <div>
                      You can reset this scenario using the <RestartHint setPulseResetButton={setPulseResetButton} />{' '}
                      button on the top right.
                    </div>
                  </li>
                )}
              </ol>
              {(instructionsNote || useCase.instructionsNote) && (
                <div className={styles.note}>
                  <div>NOTE</div>
                  <div>{instructionsNote ?? useCase.instructionsNote}</div>
                </div>
              )}
            </div>
            <div>
              {moreResourcesPresent && (
                <Button
                  onClick={() => learnMoreRef?.current?.scrollIntoView({ behavior: 'smooth' })}
                  size='large'
                  outlined
                  openNewTab
                  className={styles.resourcesButton}
                >
                  <Image src={Lightbulb} alt='Lightbulb' />
                  See related resources
                </Button>
              )}
            </div>
          </div>
        )}
      </Container>
      <div className={styles.contentWrapper}>
        <div className={styles.backgroundRectangle} />
        <Container size='large' className={styles.content}>
          <div className={styles.browserBar}>
            <div />
            <div />
            <div />
          </div>
          <div className={styles.browserContent}>{children}</div>
        </Container>
      </div>

      {moreResourcesPresent ? (
        <Container size='large' className={styles.learnMore}>
          <h3 className={styles.learnMoreTitle} ref={learnMoreRef}>
            Learn more
          </h3>
          <div className={styles.cardsContainer}>
            {moreResources?.map((resource, index) => (
              <a key={index} href={resource.url} target='_blank' rel='noreferrer' className={styles.card}>
                <div className={styles.type}>{resource.type}</div>
                <div className={styles.title}>{resource.title}</div>
              </a>
            ))}
          </div>
        </Container>
      ) : (
        <div className={styles.learnMorePlaceholder}></div>
      )}
    </>
  );
};
