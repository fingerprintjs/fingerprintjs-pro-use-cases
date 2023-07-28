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

import Dropdown from '../Dropdown/Dropdown';

import styles from './Header.module.scss';
import Link from 'next/link';
import { useLocation } from 'react-use';

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

  const { pathname } = useLocation();

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
                <DropdownMenu darkMode={darkMode} name="Use cases" className={styles.desktopOnly}>
                  <Dropdown
                    darkMode={darkMode}
                    leftColumns={[
                      {
                        // title: 'Protect',
                        list: USE_CASES.slice(0, 3),
                        cardBackground: true,
                      },
                      {
                        list: USE_CASES.slice(3),
                        cardBackground: true,
                      },
                    ]}
                  />
                </DropdownMenu>
                <DropdownMenu darkMode={darkMode} name="Platform" className={styles.desktopOnly}>
                  <Dropdown
                    darkMode={darkMode}
                    leftColumns={[{ list: [{ title: 'Playground', url: '/playground' }], cardBackground: true }]}
                  />
                </DropdownMenu>
              </div>
              <div className={styles.navRight}>
                <a
                  className={classNames(styles.desktopOnly, styles.loginLink)}
                  target="_blank"
                  rel="noreferrer"
                  href={URL.dashboardLoginUrl}
                >
                  Login
                </a>

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
          {isMobileMenuOpen && <MobileNavbar darkMode={darkMode} />}
        </div>
      </header>
    </>
  );
}
