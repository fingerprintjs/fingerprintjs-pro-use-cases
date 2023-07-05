import CouponFraud from '.';
import { GetStaticProps } from 'next';
import { AppOwnProps } from '../_app';

export default CouponFraud;

export const getStaticProps: GetStaticProps<AppOwnProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
