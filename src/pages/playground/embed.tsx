import { GetStaticProps } from 'next';
import Playground from './index';
import { CustomPageProps } from '../_app';

export default Playground;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
