import CredentialStuffing from '.';
import { GetStaticProps } from 'next';
import { AppOwnProps } from '../_app';

export default CredentialStuffing;

export const getStaticProps: GetStaticProps<AppOwnProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
