'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import styles from './Collapsible.module.scss';
import { extendUnstyledPrimitiveWithClass } from '../componentUtils';

const MyCollapsible = extendUnstyledPrimitiveWithClass(
  CollapsiblePrimitive.Collapsible,
  styles.Collapsible,
  'MyCollapsible',
);

const MyCollapsibleTrigger = extendUnstyledPrimitiveWithClass(
  CollapsiblePrimitive.CollapsibleTrigger,
  styles.CollapsibleTrigger,
  'MyCollapsibleTrigger',
);

const MyCollapsibleContent = extendUnstyledPrimitiveWithClass(
  CollapsiblePrimitive.CollapsibleContent,
  styles.CollapsibleContent,
  'MyCollapsibleContent',
);

export { MyCollapsible, MyCollapsibleTrigger, MyCollapsibleContent };
