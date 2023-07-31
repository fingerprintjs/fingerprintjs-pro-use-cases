import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import MobileNavbar from '../MobileNavbar';
import Container from '../Container';
import HeaderBar from '../HeaderBar/HeaderBar';
import classNames from 'classnames';
import { URL, USE_CASES } from '../content';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Image from 'next/image';
import LogoSvg from './fpjs.svg';
import LogoDarkSvg from './fpjsDark.svg';
import Restart from './Restart.svg';

import styles from './Header.module.scss';
import Link from 'next/link';
import Button from '../Button';

interface HeaderProps {
  notificationBar?: {
    arrowText?: string;
    barBody?: string;
    url?: string;
    backgroundColor?: string;
  };
  darkMode?: boolean;
}
export default function Header({ notificationBar, darkMode }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mobileBodyClass = 'isMobileMenuOpen';
    if (isMobileMenuOpen) {
      document.body.classList.add(mobileBodyClass);
    } else {
      document.body.classList.remove(mobileBodyClass);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {notificationBar && !isMobileMenuOpen && (
        <HeaderBar
          linkUrl={notificationBar.url}
          arrowText={notificationBar.arrowText}
          backgroundColor={notificationBar.backgroundColor}
        >
          {<div dangerouslySetInnerHTML={{ __html: notificationBar.barBody ?? '' }} />}
        </HeaderBar>
      )}
      <header className={classNames(styles.header, { [styles.darkHeader]: darkMode })}>
        <div className={styles.nav}>
          <Container size="large" className={styles.root}>
            <nav className={styles.navMain}>
              <div className={styles.navLeft}>
                <Link href="/" className={styles.link} title="Logo">
                  {darkMode ? (
                    <Image src={LogoDarkSvg} className={styles.logo} alt="Fingerprint logo" />
                  ) : (
                    <Image src={LogoSvg} className={styles.logo} alt="Fingerprint logo" />
                  )}
                </Link>
                <DropdownMenu
                  darkMode={darkMode}
                  name="Use cases"
                  className={styles.desktopOnly}
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
              </div>
              <div className={styles.navRight}>
                <button
                  className={classNames(styles.desktopOnly, styles.resetButton)}
                  onClick={() => window.alert('Reset scenarios')}
                  title="Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action."
                >
                  Restart
                  <Image src={Restart} alt="Restart button" />
                </button>
                <Button
                  href={'https://dashboard.fingerprint.com/login'}
                  size="medium"
                  variant={darkMode ? 'dark' : 'primary'}
                  outlined
                  openNewTab
                  className={styles.button}
                  buttonId="log-in-top-nav"
                >
                  Login
                </Button>

                <Button
                  variant="primary"
                  size="medium"
                  className={styles.signupButton}
                  href={URL.signupUrl}
                  openNewTab
                  buttonId="sign-up-top-nav"
                >
                  Sign up
                </Button>
                <button
                  aria-label="Mobile Menu"
                  className={classNames(styles.mobileToggler, { [styles.isOpen]: isMobileMenuOpen })}
                  onClick={handleToggleMobileMenu}
                >
                  {/* hamburger button */}
                  <span />
                  <span />
                  <span />
                  <span />
                </button>
              </div>
            </nav>
          </Container>
          {isMobileMenuOpen && <MobileNavbar darkMode={darkMode} closeMobileMenu={() => setIsMobileMenuOpen(false)} />}
        </div>
      </header>
    </>
  );
}
