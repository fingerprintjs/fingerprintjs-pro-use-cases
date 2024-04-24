import './styles/global-styles.scss';
import { FunctionComponent, PropsWithChildren } from 'react';
import Footer from './client/components/common/Footer/Footer';
import Header from './client/components/common/Header/Header';
import styles from './styles/layout.module.scss';
import DeploymentUtils from './client/DeploymentUtils';

export const Layout: FunctionComponent<PropsWithChildren<{ embed: boolean }>> = ({ children, embed }) => {
  return (
    <div className={styles.layout}>
      {embed ? null : <Header />}
      <DeploymentUtils />
      <div>{children}</div>
      {embed ? null : <Footer />}
    </div>
  );
};
