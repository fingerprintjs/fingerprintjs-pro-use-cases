import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import FlightCard, { Flight } from '../../client/components/web-scraping/FlightCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../../styles/web-scraping.module.css';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useQueryState } from 'use-location-state/next';
import { useQuery, UseQueryResult } from 'react-query';
import { GetServerSideProps, NextPage } from 'next';
import { FlightQuery } from '../api/web-scraping/flights';
import { CheckResultObject } from '../../server/checkResult';
import { USE_CASES } from '../../client/components/common/content';

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

export const WebScrapingUseCase: NextPage<QueryAsProps> = ({ from, to, disableBotDetection }) => {
  const [fromCode, setFromCode] = useQueryState('from', from?.toUpperCase() ?? AIRPORTS[0].code);
  const [toCode, setToCode] = useQueryState('to', to?.toUpperCase() ?? AIRPORTS[1].code);

  /**
   * We use the Fingerprint Pro React SDK hook to get visitor data (https://github.com/fingerprintjs/fingerprintjs-pro-react)
   * For Vue, Angular, Svelte, and other frameworks, see https://dev.fingerprint.com/docs/frontend-libraries
   * See '/client/use-visitor-data.js' for an example implementation of similar functionality without the SDK
   */
  const { getData: getVisitorData } = useVisitorData(
    {
      products: disableBotDetection ? ['identification'] : ['botd'],
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
      <UseCaseWrapper useCase={USE_CASES.webScraping}>
        <Box marginBottom={(theme) => theme.spacing(2)}>
          <Typography variant="overline">Search for today&apos;s flights</Typography>
        </Box>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            getFlightsQuery.refetch();
          }}
        >
          <Grid container spacing={1} marginBottom={3}>
            <Grid item xs={12} sm={5.5}>
              <FormControl fullWidth>
                <Autocomplete
                  id="from"
                  size="small"
                  autoHighlight
                  options={AIRPORTS.filter((airport) => airport.code !== toCode)}
                  getOptionLabel={(option) => `${option.city} (${option.code})`}
                  value={AIRPORTS.find((airport) => airport.code === fromCode) ?? null}
                  onChange={(_e, value) => setFromCode(value?.code ?? '')}
                  renderInput={(params) => <TextField {...params} label="From" />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1} display="flex" justifyContent={'center'} alignItems="center">
              <Box alignItems={'center'} display="flex" justifyContent={'center'} fontSize={28}>
                <ArrowForwardIcon className={styles.formArrow} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={5.5}>
              <FormControl fullWidth>
                <Autocomplete
                  id="to"
                  size="small"
                  autoHighlight
                  options={AIRPORTS.filter((airport) => airport.code !== fromCode)}
                  getOptionLabel={(option) => `${option.city} (${option.code})`}
                  value={AIRPORTS.find((airport) => airport.code === toCode) ?? null}
                  onChange={(e, value) => setToCode(value?.code ?? '')}
                  renderInput={(params) => <TextField {...params} label="To" />}
                />
              </FormControl>
            </Grid>
          </Grid>
          {
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              disableElevation
              fullWidth
              disabled={!toCode || !fromCode || isFetching}
            >
              Search flights
            </Button>
          }
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
      <Box display={'flex'} justifyContent={'center'} margin={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="UsecaseWrapper_alert message">
        {error.message}
      </Alert>
    );
  }
  if (message && severity !== 'success') {
    return (
      <Alert severity={severity} className="UsecaseWrapper_alert message">
        {message}
      </Alert>
    );
  }
  if (!flights) return null;
  return (
    <div>
      <Box marginTop={(theme) => theme.spacing(2)}>
        <Typography variant="overline">Found {flights.length} flights</Typography>
      </Box>
      {flights.map((flight) => (
        <FlightCard key={flight.flightNumber} flight={flight} />
      ))}
    </div>
  );
};

export default WebScrapingUseCase;
