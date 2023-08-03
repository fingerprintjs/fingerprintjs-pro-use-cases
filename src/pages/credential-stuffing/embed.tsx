import CredentialStuffing from '.';
import { GetStaticProps } from 'next';
import { CustomPageProps } from '../_app';

export default CredentialStuffing;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
