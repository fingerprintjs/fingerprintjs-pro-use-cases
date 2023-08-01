import React from 'react';
import Button from '../Button';
import classNames from 'classnames';
import styles from './MobileNavbar.module.scss';
import { URL, USE_CASES } from '../content';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Image from 'next/image';
import Restart from '../Header/Restart.svg';
import { useReset } from '../../../hooks/useReset/useReset';

interface MobileNavbarProps {
  darkMode?: boolean;
  closeMobileMenu: () => void;
}
export default function MobileNavbar({ darkMode, closeMobileMenu }: MobileNavbarProps) {
  const { mutate } = useReset({});

  return (
    <nav className={classNames(styles.nav, { [styles.darkNavHeader]: darkMode })}>
      <div className={styles.container}>
        <div className={classNames(styles.links, styles.top)}>
          <Button
            className={classNames(styles.resetButton)}
            onClick={() => mutate()}
            variant="primary"
            outlined
            size={'medium'}
            title="Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action."
          >
            Restart
            <Image src={Restart} alt="Restart button" />
          </Button>
        </div>
        <div className={classNames(styles.links, styles.top)}>
          <Button
            href={URL.dashboardLoginUrl}
            variant={darkMode ? 'dark' : 'primary'}
            outlined
            size="medium"
            openNewTab
          >
            Log in
          </Button>
          <Button variant="primary" size="medium" href={URL.signupUrl} className={styles.signupButton} openNewTab>
            Sign up
          </Button>
        </div>
        <div className={classNames(styles.links, styles.main)}>
          <div className={styles.container}>
            <DropdownMenu
              name="Use cases"
              darkMode={darkMode}
              dropdownProps={{
                darkMode,
                leftColumns: [
                  {
                    list: USE_CASES.slice(0, 3),
                    cardBackground: true,
                  },
                  {
                    list: USE_CASES.slice(3),
                    cardBackground: true,
                  },
                ],
              }}
              onLinkClick={closeMobileMenu}
            />

            <DropdownMenu
              darkMode={darkMode}
              name="Platform"
              className={styles.desktopOnly}
              dropdownProps={{
                darkMode,
                leftColumns: [{ list: [{ title: 'Playground', url: '/playground' }], cardBackground: true }],
              }}
              onLinkClick={closeMobileMenu}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
