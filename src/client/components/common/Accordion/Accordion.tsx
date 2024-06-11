'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classnames from 'classnames';
import styles from './Accordion.module.scss';
import { ButtonPlusSvgThin } from '../../../img/buttonPlusSvg';
import { ButtonMinusSvgThin } from '../../../img/buttonMinusSvg';

/**
 * References
 * https://ui.shadcn.com/docs/components/accordion
 * https://www.radix-ui.com/primitives/docs/components/accordion
 */
const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root ref={ref} className={classnames(styles.AccordionRoot, className)} {...props} />
));
Accordion.displayName = AccordionPrimitive.Root.displayName;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={classnames(styles.AccordionItem, className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className={styles.AccordionHeader}>
    <AccordionPrimitive.Trigger ref={ref} className={classnames(styles.AccordionTrigger, className)} {...props}>
      <div>{children}</div>
      <div>
        <ButtonPlusSvgThin className={styles.plusButton} />
        <ButtonMinusSvgThin className={styles.minusButton} />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={styles.AccordionContent} {...props}>
    <div className={classnames(className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
