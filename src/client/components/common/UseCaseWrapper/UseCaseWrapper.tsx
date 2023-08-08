import { ElementRef, FunctionComponent, useRef } from 'react';
import Container from '../Container';
import styles from './UseCaseWrapper.module.scss';
import Button from '../Button';
import Lightbulb from './lightbulb.svg';
import Image from 'next/image';
import { Paper } from '@mui/material';
import { UseCase } from '../content';

type UseCaseWrapperProps = {
  title: string;
  description?: React.ReactNode;
  articleURL?: string;
  listItems?: React.ReactNode[];
  children: React.ReactNode;
  hideSrcListItem?: boolean;
  hideDivider?: boolean;
  showAdminLink?: boolean;
  returnUrl?: string;
  contentSx?: React.CSSProperties;
  moreResources?: UseCase['moreResources'];
};

export const UseCaseWrapper: FunctionComponent<UseCaseWrapperProps> = ({
  title,
  description,
  articleURL,
  listItems,
  children,
  hideSrcListItem = false,
  showAdminLink = true,
  contentSx,
  moreResources,
}) => {
  const learnMoreRef = useRef<ElementRef<'h3'>>();

  return (
    <>
      <Container size="large">
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>{description}</div>
        {listItems?.length > 0 && (
          <div className={styles.howToUse}>
            <div>
              <h2>How to use this demo</h2>
              <ol>
                {listItems?.map((item, index) => (
                  <li key={index}>
                    {/* The wrapper div here is necessary for styles to work. */}
                    <div>{item}</div>
                  </li>
                ))}
                {showAdminLink && (
                  <li>
                    <div>
                      You can reset this scenario using the <b>Restart</b> button on the top right.
                    </div>
                  </li>
                )}
                {articleURL && (
                  <li>
                    <div>
                      Learn more about this scenario in the{' '}
                      <a href={articleURL} target="_blank" rel="noreferrer">
                        {title}
                      </a>{' '}
                      article.
                    </div>
                  </li>
                )}
                {!hideSrcListItem && (
                  <li>
                    <div>
                      See the source code for this and other use cases{' '}
                      <a
                        href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases"
                        target="_blank"
                        rel="noreferrer"
                      >
                        on GitHub
                      </a>
                      .
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
                  buttonId="log-in-top-nav"
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
          <Paper
            elevation={0}
            sx={{
              padding: (theme) => theme.spacing(4),
              maxWidth: '600px',
              margin: '64px auto ',
              ...contentSx,
            }}
          >
            {children}
          </Paper>
        </Container>
      </div>

      {moreResources?.length > 0 ? (
        <div className={styles.learnMoreContainer}>
          <Container size="large" className={styles.learnMore}>
            <h3 className={styles.learnMoreTitle} ref={learnMoreRef}>
              Learn More
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
        </div>
      ) : (
        <div className={styles.learnMorePlaceholder}></div>
      )}
    </>
  );
};
