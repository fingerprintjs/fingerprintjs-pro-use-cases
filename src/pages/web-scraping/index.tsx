import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import FlightCard, { Flight } from '../../client/components/web-scraping/FlightCard';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useQueryState } from 'next-usequerystate';
import { useQuery, UseQueryResult } from 'react-query';
import { GetServerSideProps, NextPage } from 'next';
import { FlightQuery } from '../api/web-scraping/flights';
import { CheckResultObject } from '../../server/checkResult';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import { Select, SelectItem } from '../../client/components/common/Select/Select';
import ArrowIcon from '../../client/img/arrowRight.svg';
import Image from 'next/image';
import styles from './webScraping.module.scss';
import Button from '../../client/components/common/Button/Button';
import Alert from '../../client/components/common/Alert/Alert';
import { Spinner } from '../../client/components/common/Spinner/Spinner';

// Make URL query object available as props to the page on first render
// to read `from`, `to` params and a `disableBotDetection` param for testing and demo purposes
export const getServerSideProps: GetServerSideProps<QueryAsProps> = async ({ query }) => {
  const { from, to, disableBotDetection } = query;
  return {
    props: {
      from: (from as string) ?? null,
      to: (to as string) ?? null,
      disableBotDetection: disableBotDetection === '1' || disableBotDetection === 'true',
    },
  };
};

type FlightQueryResult = CheckResultObject<Flight[]>;

export const AIRPORTS = [
  { city: 'San Francisco', code: 'SFO' },
  { city: 'New York', code: 'JFK' },
  { city: 'London', code: 'LHR' },
  { city: 'Tokyo', code: 'HND' },
  { city: 'Paris', code: 'CDG' },
  { city: 'Hong Kong', code: 'HKG' },
  { city: 'Singapore', code: 'SIN' },
  { city: 'Dubai', code: 'DXB' },
  { city: 'Shanghai', code: 'PVG' },
  { city: 'Seoul', code: 'ICN' },
  { city: 'Bangkok', code: 'BKK' },
  { city: 'Amsterdam', code: 'AMS' },
  { city: 'Beijing', code: 'PEK' },
  { city: 'Frankfurt', code: 'FRA' },
  { city: 'Cape Town', code: 'CPT' },
  { city: 'Sydney', code: 'SYD' },
  { city: 'Melbourne', code: 'MEL' },
  { city: 'Toronto', code: 'YYZ' },
  { city: 'Vancouver', code: 'YVR' },
  { city: 'Montreal', code: 'YUL' },
  { city: 'Brussels', code: 'BRU' },
  { city: 'Copenhagen', code: 'CPH' },
  { city: 'Oslo', code: 'OSL' },
  { city: 'Stockholm', code: 'ARN' },
  { city: 'Helsinki', code: 'HEL' },
  { city: 'Rome', code: 'FCO' },
];

type QueryAsProps = {
  from: string | null;
  to: string | null;
  disableBotDetection: boolean;
};

export const WebScrapingUseCase: NextPage<QueryAsProps & CustomPageProps> = ({
  from,
  to,
  disableBotDetection,
  embed,
}) => {
  const [fromCode, setFromCode] = useQueryState('from', { defaultValue: from?.toUpperCase() ?? AIRPORTS[0].code });
  const [toCode, setToCode] = useQueryState('to', { defaultValue: to?.toUpperCase() ?? AIRPORTS[1].code });

  /**
   * We use the Fingerprint Pro React SDK hook to get visitor data (https://github.com/fingerprintjs/fingerprintjs-pro-react)
   * For Vue, Angular, Svelte, and other frameworks, see https://dev.fingerprint.com/docs/frontend-libraries
   * See '/client/use-visitor-data.js' for an example implementation of similar functionality without the SDK
   */
  const { getData: getVisitorData } = useVisitorData(
    {
      // Don't use a cached fingerprint, it must be fresh to avoid replay attacks
      ignoreCache: true,
    },
    // Don't fingerprint the visitor on mount, but when they click "Search flights", the fingerprint must be fresh
    { immediate: false },
  );

  /**
   * We use React Query to easily keep track of the state of the flights request (https://react-query-v3.tanstack.com/)
   * But you can achieve the same result with plain old `fetch` and `useState`
   */
  const getFlightsQuery = useQuery<FlightQueryResult, Error>(
    ['getFlights'],
    async () => {
      const { requestId } = await getVisitorData();
      const response = await fetch(`/api/web-scraping/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromCode,
          to: toCode,
          requestId,
          disableBotDetection,
        } as FlightQuery),
      });
      if (response.status < 500) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch flights: ' + response.statusText);
      }
    },
    {
      refetchOnMount: 'always',
      retry: false,
    },
  );

  const { isFetching } = getFlightsQuery;

  return (
    <>
      <UseCaseWrapper useCase={USE_CASES.webScraping} embed={embed}>
        <h2 className={styles.searchTitle}>Search for today&apos;s flights</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            getFlightsQuery.refetch();
          }}
          className={styles.form}
        >
          <div className={styles.formInput}>
            <div>
              <div className={styles.locationLabel}>From</div>
              <Select value={fromCode} onValueChange={(value: string) => setFromCode(value)} fullWidth>
                {AIRPORTS.filter((airport) => airport.code !== toCode).map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code})
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Image src={ArrowIcon} alt="" className={styles.arrowIcon} />
            <div>
              <div className={styles.locationLabel}>To</div>
              <Select value={toCode} onValueChange={(value: string) => setToCode(value)} fullWidth>
                {AIRPORTS.filter((airport) => airport.code !== fromCode).map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code})
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Button
              type="submit"
              size="medium"
              variant="primary"
              className={styles.searchButton}
              disabled={!toCode || !fromCode || isFetching}
            >
              Search
            </Button>
          </div>
        </form>
        <Results {...getFlightsQuery} />
      </UseCaseWrapper>
    </>
  );
};

const Results = ({ data, isFetching, error }: UseQueryResult<FlightQueryResult, Error>) => {
  const { data: flights, message, severity } = data ?? {};

  if (isFetching) {
    return (
      <div className={styles.loaderContainer}>
        <Spinner size={40} thickness={4} />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }
  if (message && severity !== 'success') {
    return <Alert severity={severity ?? 'warning'}>{message}</Alert>;
  }
  if (!flights) return null;
  return (
    <div className={styles.flightCardsContainer}>
      {flights.map((flight) => (
        <FlightCard key={flight.flightNumber} flight={flight} />
      ))}
    </div>
  );
};

export default WebScrapingUseCase;
