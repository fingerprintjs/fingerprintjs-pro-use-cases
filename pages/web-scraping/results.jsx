import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import { FingerprintJsServerApiClient, Region } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { SERVER_API_KEY } from '../../server/const';
import { isRequestIdFormatValid, visitIpMatchesRequestIp } from '../../server/checks';

/**
 * @typedef {Object} FlightResultsProps
 * @property {boolean} isBadBot
 */

/**
 * @param {FlightResultsProps} props - Props for the component
 * @returns {JSX.Element} React component
 */
export const FlightResults = ({ isBadBot }) => {
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
        {isBadBot ? (
          <p>Sorry bot, you are not allowed to see the results</p>
        ) : (
          <p> Hello human, here are your flights </p>
        )}
      </UseCaseWrapper>
    </>
  );
};

/**
 * @typedef {Object} ResultsQuery
 * @property {string} from
 * @property {string} to
 * @property {string} requestId
 * */

/**
 * @type {import('next').GetServerSideProps<FlightResultsProps>}
 */
export async function getServerSideProps({ query, req }) {
  const { from, to, requestId } = /** @type {ResultsQuery} */ (query);

  if (!isRequestIdFormatValid(requestId)) {
    return { props: { isBadBot: true } };
  }

  const client = new FingerprintJsServerApiClient({ region: Region.Global, apiKey: SERVER_API_KEY });

  try {
    /** @type {import('@fingerprintjs/fingerprintjs-pro-server-api').EventResponse} */
    const eventResponse = await client.getEvent(requestId);
    const botData = eventResponse.products.botd.data;
    const visitData = eventResponse.products.identification.data;

    if (botData.bot.result === "bad") {
        console.log("Bad bot detected");
        return { props: { isBadBot: true } };
    }
    if (botData.bot.result === "good") {
        console.log("Good detected");
        return { props: { isBadBot: false } };
    }
    if (Date.now() - visitData.timestamp > 3000) {
        console.log(Date.now());
        console.log(visitData.timestamp);
        console.log(Date.now() - visitData.timestamp);
        console.log("Request is too old, potential replay attack")
        return { props: { isBadBot: true } };
    }
    if (!visitIpMatchesRequestIp(visitData, req)) {
        console.log("Page requested from IP that doesn't match the IP of the fingerprinted visit, potential spoofing attack");
        return { props: { isBadBot: true } };
    }



  } catch (error) {
        console.error(error);
        return { props: { isBadBot: true } };
    };
  

  return { props: { isBadBot: false } };
}

export default FlightResults;

