import { UseCaseWrapper } from '../../client/components/use-case-wrapper';

/**
 * @typedef {Object} FlightResultsProps
 * @property {boolean} isBadBot 
 */

/**
 * @param {FlightResultsProps} props - Props for the component
 * @returns {JSX.Element} React component
 */
export const FlightResults = ({isBadBot}) => {
  return (
    <>
      <UseCaseWrapper
        title="Web Scraping Prevention"
        description={`
            Web scraping is the process of extracting data from websites.
            It is a powerful tool for data scientists and researchers, 
            but it can also be used for malicious purposes. 
            In this use case, we will show how to prevent web scraping with Fingerprint Pro
        `}
        articleURL="https://fingerprintjs.com/blog/web-scraping-prevention/"
        listItems={[<>In this demo we will do something fun</>]}
      >
        <h1>Flight search results</h1>
        <p>Is bad bot: {String(isBadBot)}</p>
        {isBadBot && <p>Sorry, you are not allowed to see the results</p>}
      </UseCaseWrapper>
    </>
  );
};

/**
 * @type {import('next').GetServerSideProps<FlightResultsProps>}
 */
export async function getServerSideProps({ req, query }) {
    console.log(query.from, query.to, query.requestId);
  return { props: { isBadBot: true } } ;
}

export default FlightResults;
