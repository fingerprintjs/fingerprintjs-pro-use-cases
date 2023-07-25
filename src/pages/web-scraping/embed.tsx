import { GetStaticProps } from 'next';
import WebScraping from './index';
import { CustomPageProps } from '../_app';

export default WebScraping;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
