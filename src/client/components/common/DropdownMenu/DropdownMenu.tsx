import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import ExpandMoreSvg from '../../../img/expand-more.svg';
import styles from './DropdownMenu.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import useOnClickOutside from '../../../hooks/useOnClickOutside';
import Image from 'next/image';
import Dropdown, { DropdownProps } from '../Dropdown/Dropdown';

export interface DropdownMenuProps {
  name: string;
  children?: React.ReactNode;
  className?: string;
  darkMode?: boolean;
  dropdownProps: DropdownProps;
  onLinkClick?: () => void;
}
export default function DropdownMenu({ name, className, darkMode, dropdownProps, onLinkClick }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div className={classNames(className, { [styles.darkDropdown]: darkMode })} ref={ref}>
      <span onClick={() => setIsOpen(!isOpen)} className={styles.link}>
        {name}
        <Image
          src={ExpandMoreSvg}
          className={classNames(styles.icon, {
            [styles.iconIsOpen]: isOpen,
            [styles.iconHover]: typeof isOpen === 'undefined',
          })}
          alt={'expand more'}
        />
      </span>
      <AnimatePresence initial={false}>
        {dropdownProps && isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{
              opacity: 0,
              translateY: -15,
            }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -15, transition: { duration: 0.15 } }}
          >
            <Dropdown
              {...dropdownProps}
              closeDropdown={() => {
                setIsOpen(false);
                onLinkClick?.();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
