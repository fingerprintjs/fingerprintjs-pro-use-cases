import { GetStaticProps } from 'next';
import PaymentFraudEventRiskScore from './index';
import { CustomPageProps } from '../_app';

export default PaymentFraudEventRiskScore;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
