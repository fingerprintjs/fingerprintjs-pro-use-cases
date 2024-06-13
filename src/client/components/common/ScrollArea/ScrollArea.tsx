import React from 'react';
import { Root, Viewport, Scrollbar, Corner, Thumb } from '@radix-ui/react-scroll-area';
import styles from './ScrollArea.module.scss';
import classnames from 'classnames';

export const MyScrollArea = React.forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, children, ...props }, ref) => (
  <Root ref={ref} className={classnames(className, styles.ScrollAreaRoot)} {...props}>
    <Viewport className={styles.ScrollAreaViewport}>{children}</Viewport>
    <Scrollbar className={styles.ScrollAreaScrollbar} orientation='vertical'>
      <Thumb className={styles.ScrollAreaThumb} />
    </Scrollbar>
    <Scrollbar className={styles.ScrollAreaScrollbar} orientation='horizontal'>
      <Thumb className={styles.ScrollAreaThumb} />
    </Scrollbar>
    <Corner className={styles.ScrollAreaCorner} />
  </Root>
));

MyScrollArea.displayName = 'MyScrollArea';
