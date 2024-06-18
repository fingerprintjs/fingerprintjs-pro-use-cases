import { FunctionComponent } from 'react';
import { ResourceLink } from '../content';
import styles from './ResourceLinks.module.scss';

export const ResourceLinks: FunctionComponent<{ resources: ResourceLink[] }> = ({ resources }) => {
  return (
    <div className={styles.cardsContainer}>
      {resources?.map((resource, index) => (
        <a key={index} href={resource.url} target='_blank' rel='noreferrer' className={styles.card}>
          <div className={styles.type}>{resource.type}</div>
          <div className={styles.title}>{resource.title}</div>
        </a>
      ))}
    </div>
  );
};
