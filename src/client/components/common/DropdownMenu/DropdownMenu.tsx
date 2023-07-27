import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import ExpandMoreSvg from '../../../img/expand-more.svg';
import styles from './DropdownMenu.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import useOnClickOutside from '../../../hooks/useOnClickOutside';
import Image from 'next/image';

export interface DropdownMenuProps {
  name: string;
  children?: React.ReactNode;
  className?: string;
  darkMode?: boolean;
}
export default function DropdownMenu({ name, children, className, darkMode }: DropdownMenuProps) {
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
        {/* <ExpandMoreSvg
          className={classNames(styles.icon, {
            [styles.iconIsOpen]: isOpen,
            [styles.iconHover]: typeof isOpen === 'undefined',
          })}
        /> */}
      </span>
      <AnimatePresence initial={false}>
        {children && isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{
              opacity: 0,
              translateY: -15,
            }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -15, transition: { duration: 0.15 } }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
