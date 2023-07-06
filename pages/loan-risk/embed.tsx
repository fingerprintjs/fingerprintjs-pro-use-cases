import { GetStaticProps } from 'next';
import LoanRisk from './index';
import { CustomPageProps } from '../_app';

export default LoanRisk;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
