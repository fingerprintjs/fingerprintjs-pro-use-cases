// @ts-check
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
import { useEffect, useState } from 'react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import FlightCard from '../../client/components/web-scraping/FlightCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../../styles/web-scraping.module.css';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import Link from 'next/link';
import { useQueryState } from 'use-location-state/next';

// Make URL query object available as props to the page on first render
// to read `from`, `to` params and a `disableBotDetection` param for testing and demo purposes
export { getServerSideProps } from 'use-location-state/next';

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
/**
 * @typedef WebScrapingQuery
 * @property {string} [from]
 * @property {string} [to]
 * @property {boolean} [disableBotDetection]
 */

/**
 * @param {WebScrapingQuery} query - getServerSideProps converts query params to an object and passes it to the page as props
 * @returns {JSX.Element} React component
 */
export const WebScrapingUseCase = ({ from, to, disableBotDetection }) => {
  const [fromCode, setFromCode] = useQueryState('from', from?.toUpperCase() ?? AIRPORTS[0].code);
  const [toCode, setToCode] = useQueryState('to', to?.toUpperCase() ?? AIRPORTS[1].code);

  /** @typedef {import('../../client/components/web-scraping/FlightCard').Flight} Flight */
  /** @type {[Flight[] | undefined, React.Dispatch<Flight[] | undefined>]} */
  const [flights, setFlights] = useState();
  const [message, setMessage] = useState('');

  /** @typedef {import('../../server/server').Severity} Severity */
  /** @type {[Severity | undefined, React.Dispatch<Severity>]} */
  const [messageSeverity, setMessageSeverity] = useState();
  const [loading, setLoading] = useState(false);

  // Search for flights when the page loads
  useEffect(() => {
    if (fromCode && toCode) {
      searchFlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Use the Fingerprint Pro React SDK hook to get visitor data (https://github.com/fingerprintjs/fingerprintjs-pro-react)
   * For Vue, Angular, Svelte, and other frameworks, see https://dev.fingerprint.com/docs/frontend-libraries
   * See '/client/use-visitor-data.js' for an example implementation of similar functionality without the SDK
   */
  const { getData } = useVisitorData(
    {
      products: disableBotDetection ? ['identification'] : ['botd'],
      // Don't use a cached fingerprint, it must be fresh to avoid replay attacks
      ignoreCache: true,
    },
    // Don't fingerprint the visitor on mount, but when they click "Search flights", the fingerprint must be fresh
    { immediate: false }
  );

  async function searchFlights() {
    setLoading(true);
    setMessage('');
    const visitorData = await getData();
    try {
      /** @type {import('../../server/checkResult').CheckResult} */
      const result = await (
        await fetch(`/api/web-scraping/flights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromCode,
            to: toCode,
            requestId: visitorData.requestId,
          }),
        })
      ).json();
      setLoading(false);
      setFlights(result.data);
      if (result.severity !== 'success') {
        setMessage(result.message);
        setMessageSeverity(result.severity);
      }
    } catch (error) {
      setLoading(false);
      setMessageSeverity('error');
      setMessage(error.toString());
      console.log(error);
    }
  }

  return (
    <>
      <UseCaseWrapper
        title="Web Scraping Prevention"
        showAdminLink={false}
        description={
          <div>
            <p>
              Web scraping is the process of extracting data from websites using automated scripts or bots. If your
              website shows data that is expensive to collect or compute (e.g., flight connections and prices), a bad
              actor or competitor could steal it and use it for their own purposes.
            </p>
            <p>
              Protecting the data with CAPCHAs hurts user experience and server-side bot detection based on IP address
              reputation is not reliable. Fingerprint Pro provides client-side bot detection that can recognize even
              sophisticated bots and browser automation tools.
            </p>
          </div>
        }
        // Todo: Add a link to the blog post when it's published
        // articleURL="https://fingerprintjs.com/blog/web-scraping-prevention/"
        listItems={[
          <>
            The <code>flights</code> API endpoint on this page is protected by{' '}
            <a href="https://dev.fingerprint.com/docs/bot-detection-quick-start-guide" target={'_blank'}>
              {' '}
              Fingerprint Pro Bot Detection
            </a>
            .
          </>,
          <>Using a normal browser, you can search for flights and see the results.</>,
          <>
            Try scraping the results using Selenium, Puppeteer, Playwright, Cypress, or a{' '}
            <a href="https://dev.fingerprint.com/docs/bot-detection-vs-botd" target="_blank">
              similar tool
            </a>
            .
          </>,
          <>The endpoint will return an error message if the request is coming from a bot.</>,
          <>
            Try tampering with the <code>requestId</code> parameter, request headers or changing your IP address, see if
            that helps 🙂
          </>,
          <>
            To see how the page would behave without Bot Detection, reload it with{' '}
            <Link href={'/web-scraping?disableBotDetection=1'}>
              <code className="nowrap">?disableBotDetection=1</code>
            </Link>{' '}
            in the URL.
          </>,
        ]}
      >
        <Box marginBottom={(theme) => theme.spacing(2)}>
          <Typography variant="overline">Search for today&apos;s flights</Typography>
        </Box>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            searchFlights();
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
              disabled={!toCode || !fromCode || loading}
            >
              Search flights
            </Button>
          }
          {loading && (
            <Box display={'flex'} justifyContent={'center'} margin={3}>
              <CircularProgress />
            </Box>
          )}
          {!loading && message && (
            <Alert severity={messageSeverity} className="UsecaseWrapper_alert message">
              {message}
            </Alert>
          )}
        </form>
        {flights && flights.length > 0 && !loading && (
          <div>
            <Box marginTop={(theme) => theme.spacing(2)}>
              <Typography variant="overline">Found {flights.length} flights</Typography>
            </Box>
            {flights.map((flight) => (
              <FlightCard key={flight.flightNumber} flight={flight} />
            ))}
          </div>
        )}
      </UseCaseWrapper>
    </>
  );
};

export default WebScrapingUseCase;
