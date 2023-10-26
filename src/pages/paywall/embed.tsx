import { GetServerSideProps } from 'next';
import Paywall from './index';
import { CustomPageProps } from '../_app';

export default Paywall;

export const getServerSideProps: GetServerSideProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
