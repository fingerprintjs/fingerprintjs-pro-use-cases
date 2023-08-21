import { ElementRef, FunctionComponent, useRef, useState } from 'react';
import Container from '../Container';
import styles from './UseCaseWrapper.module.scss';
import Button from '../Button';
import Lightbulb from './lightbulb.svg';
import Image from 'next/image';
import { Paper, Tooltip } from '@mui/material';
import { UseCase } from '../content';
import ExternalLinkIcon from '../../../img/externalLinkArrow.svg';
import RestartIcon from '../../../img/restart.svg';
import { useReset } from '../../../hooks/useReset/useReset';
import classNames from 'classnames';

type UseCaseWrapperProps = {
  useCase: Partial<UseCase>;
  children: React.ReactNode;
  hideGithubLink?: boolean;
  returnUrl?: string;
  contentSx?: React.CSSProperties;
  embed?: boolean;
};

type RestartHintProps = {
  setPulseResetButton: (value: boolean) => void;
};

const RestartHint: React.FC<RestartHintProps> = ({ setPulseResetButton }) => {
  return (
    <b
      onMouseEnter={() => setPulseResetButton(true)}
      onMouseLeave={() => setPulseResetButton(false)}
      style={{ cursor: 'help' }}
    >
      Restart
    </b>
  );
};

export const UseCaseWrapper: FunctionComponent<UseCaseWrapperProps> = ({
  children,
  hideGithubLink: hideSrcListItem = false,
  contentSx,
  useCase,
  embed,
}) => {
  const { title, description, articleUrl, instructions, moreResources, doNotMentionResetButton } = useCase ?? {};
  const learnMoreRef = useRef<ElementRef<'h3'>>();

  const { mutate, shouldDisplayResetButton, isLoading } = useReset({});
  const [pulseResetButton, setPulseResetButton] = useState(false);

  return (
    <>
      {embed && shouldDisplayResetButton && (
        <Tooltip title="Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action.">
          <div
            className={classNames([
              styles.floatyResetButton,
              isLoading && styles.loading,
              pulseResetButton && styles.pulse,
            ])}
            onClick={() => !isLoading && mutate()}
          >
            <div className={styles.resetTitle}>Restart</div>
            <Image src={RestartIcon} alt="Reset scenario" />
          </div>
        </Tooltip>
      )}
      <Container size="large">
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>{description}</div>
        <div className={styles.externalLinks}>
          {!hideSrcListItem && (
            <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases" target="_blank" rel="noreferrer">
              See on GitHub
              <Image src={ExternalLinkIcon} alt="" />
            </a>
          )}
          {articleUrl && (
            <a href={articleUrl} target="_blank" rel="noreferrer">
              See technical tutorial
              <Image src={ExternalLinkIcon} alt="" />
            </a>
          )}
        </div>
        {instructions?.length > 0 && (
          <div className={styles.howToUse}>
            <div>
              <h2>How to use this demo</h2>
              <ol>
                {instructions?.map((item, index) => (
                  <li key={index}>
                    {/* The wrapper div here is necessary for styles to work. */}
                    <div>{item}</div>
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
            </div>
            <div>
              {moreResources?.length > 0 && (
                <Button
                  onClick={() => learnMoreRef?.current?.scrollIntoView({ behavior: 'smooth' })}
                  size="large"
                  outlined
                  openNewTab
                  className={styles.resourcesButton}
                >
                  <Image src={Lightbulb} alt="Lightbulb" />
                  See related resources
                </Button>
              )}
            </div>
          </div>
        )}
      </Container>
      <div className={styles.contentWrapper}>
        <div className={styles.backgroundRectangle} />
        <Container size="large" className={styles.content}>
          <div className={styles.browserBar}>
            <div />
            <div />
            <div />
          </div>
          <Paper
            elevation={0}
            sx={{
              padding: {
                xs: '24px 16px 32px 16px',
                md: '64px 56px',
              },
              maxWidth: '600px',
              margin: '0px auto',
              borderRadius: '12px',
              ...contentSx,
            }}
          >
            {children}
          </Paper>
        </Container>
      </div>

      {moreResources?.length > 0 ? (
        <Container size="large" className={styles.learnMore}>
          <h3 className={styles.learnMoreTitle} ref={learnMoreRef}>
            Learn more
          </h3>
          <div className={styles.cardsContainer}>
            {moreResources?.map((resource, index) => (
              <a key={index} href={resource.url} target="_blank" rel="noreferrer" className={styles.card}>
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
