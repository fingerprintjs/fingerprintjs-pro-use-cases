import { GetServerSideProps } from 'next';
import Paywall, { getServerSideProps as indexGetServerSideProps } from './index';
import { CustomPageProps } from '../_app';

export default Paywall;

export const getServerSideProps: GetServerSideProps<CustomPageProps> = async () => {
  return {
    props: {
      ...(await indexGetServerSideProps()).props,
      embed: true,
    },
  };
};
