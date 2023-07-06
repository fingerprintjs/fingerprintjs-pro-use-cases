import { GetStaticProps } from 'next';
import PaymentFraud from './index';
import { CustomPageProps } from '../_app';

export default PaymentFraud;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
