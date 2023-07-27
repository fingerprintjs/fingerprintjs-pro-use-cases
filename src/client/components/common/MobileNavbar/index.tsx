import React from 'react';
import Button from '../Button';
import classNames from 'classnames';
import styles from './MobileNavbar.module.scss';
import { URL, PATH, solutionsDropdown, industryDropdown, platformDropdown, resourcesDropdown } from '../content';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Dropdown from '../Dropdown/Dropdown';
import Link from 'next/link';

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
            <DropdownMenu name="Platform" darkMode={darkMode}>
              <Dropdown
                leftColumns={[{ title: 'Platform', list: platformDropdown.capabilities, cardBackground: true }]}
                rightColumn={{ title: 'Capabilities', list: platformDropdown.integrations }}
                darkMode={darkMode}
                bottomLinkTextRight="Bot detection"
                bottomLinkUrlRight={PATH.botD}
              />
            </DropdownMenu>
            <DropdownMenu name="Solutions" darkMode={darkMode}>
              <Dropdown
                leftColumns={[
                  { title: 'Protect', list: solutionsDropdown.protect },
                  { title: 'Grow', list: solutionsDropdown.grow },
                ]}
                rightColumn={{ title: 'By Industry', list: industryDropdown }}
                bottomLinkText="All Use Cases"
                bottomLinkUrl={PATH.useCases}
                darkMode={darkMode}
              />
            </DropdownMenu>

            <DropdownMenu name="Resources" darkMode={darkMode}>
              <Dropdown leftColumns={[{ list: resourcesDropdown, cardBackground: true }]} darkMode={darkMode} />
            </DropdownMenu>
            <Link href={PATH.pricingUrl} className={styles.link}>
              Pricing
            </Link>
            <Link href={PATH.demoUrl} className={styles.link}>
              Demo
            </Link>

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
