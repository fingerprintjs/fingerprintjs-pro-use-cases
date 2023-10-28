import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import classnames from 'classnames';
import styles from './Select.module.scss';
import ChevronIcon from '../../../img/chevron.svg';
import CheckIcon from '../../../img/check.svg';
import Image from 'next/image';

export const Select = React.forwardRef<
  HTMLButtonElement,
  RadixSelect.SelectProps & React.RefAttributes<HTMLButtonElement> & { placeholder?: string; fullWidth?: boolean }
>(({ children, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Root {...props}>
      <RadixSelect.Trigger
        className={classnames(styles.SelectTrigger, props.fullWidth && styles.fullWidth)}
        ref={forwardedRef}
      >
        <RadixSelect.Value placeholder={props.placeholder} />
        <RadixSelect.Icon className={styles.SelectIcon}>
          <Image src={ChevronIcon} alt="" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className={styles.SelectContent} position="popper" style={{ zIndex: 1 }}>
          <RadixSelect.Viewport className={styles.SelectViewport}>{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  RadixSelect.SelectItemProps & React.RefAttributes<HTMLDivElement>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Item className={classnames(styles.SelectItem, className)} {...props} ref={forwardedRef}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={styles.SelectItemIndicator}>
        <Image src={CheckIcon} width={12} alt="" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});
