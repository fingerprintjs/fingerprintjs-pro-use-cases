import CouponFraud from '.';
import { GetStaticProps } from 'next';
import { CustomPageProps } from '../_app';

export default CouponFraud;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
