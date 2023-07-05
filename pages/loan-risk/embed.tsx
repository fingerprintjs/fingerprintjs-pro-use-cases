import { GetStaticProps } from 'next';
import LoanRisk from './index';
import { AppOwnProps } from '../_app';

export default LoanRisk;

export const getStaticProps: GetStaticProps<AppOwnProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};