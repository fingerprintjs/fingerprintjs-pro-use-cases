import React from 'react';
import Button from '../Button';
import classNames from 'classnames';
import styles from './MobileNavbar.module.scss';
import { URL, PATH, USE_CASES } from '../content';
import DropdownMenu from '../DropdownMenu/DropdownMenu';

interface MobileNavbarProps {
  darkMode?: boolean;
}
export default function MobileNavbar({ darkMode }: MobileNavbarProps) {
  return (
    <nav className={classNames(styles.nav, { [styles.darkNavHeader]: darkMode })}>
      <div className={styles.container}>
        <div className={classNames(styles.links, styles.top)}>
          <Button href={PATH.contactSales} variant={darkMode ? 'dark' : 'primary'} outlined size="medium">
            Contact Sales
          </Button>
          <Button variant="primary" size="medium" href={URL.signupUrl} className={styles.signupButton}>
            Get Started
          </Button>
        </div>
        <div className={classNames(styles.links, styles.main)}>
          <div className={styles.container}>
            <DropdownMenu
              name="Platform"
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
            />

            <DropdownMenu
              darkMode={darkMode}
              name="Platform"
              className={styles.desktopOnly}
              dropdownProps={{
                darkMode,
                leftColumns: [{ list: [{ title: 'Playground', url: '/playground' }], cardBackground: true }],
              }}
            />

            {/* <Link href={PATH.pricingUrl} className={styles.link}>
              Pricing
            </Link>
            <Link href={PATH.demoUrl} className={styles.link}>
              Demo
            </Link> */}

            <a href={URL.dashboardLoginUrl} className={styles.link} target="_blank" rel="noreferrer">
              Login
            </a>
            <a href={URL.signupUrl} className={styles.link} target="_blank" rel="noreferrer">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
