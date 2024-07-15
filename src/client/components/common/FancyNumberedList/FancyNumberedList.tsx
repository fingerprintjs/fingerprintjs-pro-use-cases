import { FunctionComponent, ReactNode } from 'react';
import styles from './FancyNumberedList.module.scss';

export const FancyNumberedList: FunctionComponent<React.ComponentPropsWithoutRef<'ol'> & { items: ReactNode[] }> = ({
  items,
  ...props
}) => {
  return (
    <ol className={styles.fancyNumberedList} {...props}>
      {items.map((item, index) => (
        <li key={index}>
          {/* The wrapper div here is necessary for styles to work. */}
          <div>{item}</div>
        </li>
      ))}
    </ol>
  );
};
