import LoanRisk from './index';

export default LoanRisk;

export const getStaticProps = async () => {
  return {
    props: {
      embed: true,
    },
  };
};
