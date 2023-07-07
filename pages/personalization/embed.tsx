import { GetStaticProps } from 'next';
import Personalization from './index';
import { CustomPageProps } from '../_app';

export default Personalization;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
