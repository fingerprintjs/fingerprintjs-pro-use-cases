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
import React, { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import FlightCard from '../../client/components/web-scraping/FlightCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../../styles/web-scraping.module.css';
import { useVisitorData } from '../../client/use-visitor-data';

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

export const WebScrapingUseCase = () => {
  const [from, setFrom] = useState(AIRPORTS[0].code);
  const [to, setTo] = useState(AIRPORTS[1].code);

  /** @typedef {import('../../client/components/web-scraping/FlightCard').Flight} Flight */
  /** @type {[Flight[] | undefined, React.Dispatch<Flight[] | undefined>]} */
  const [flights, setFlights] = useState();
  const [message, setMessage] = useState('');

  /** @typedef {import('../../server/server').Severity} Severity */
  /** @type {[Severity | undefined, React.Dispatch<Severity>]} */
  const [messageSeverity, setMessageSeverity] = useState();
  const [loading, setLoading] = useState(false);

  // Don't invoke query on mount, use bot detection
  const visitorDataQuery = useVisitorData({ enabled: false, products: ['botd', 'identification'] });

  /**
  //* @type {React.FormEventHandler<HTMLFormElement>}
  //*/
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const { data } = await visitorDataQuery.refetch();
    try {
      /** @type {import('../../server/checkResult').CheckResult} */
      const result = await (
        await fetch(`/api/web-scraping/flights?from=${from}&to=${to}&requestId=${data?.requestId}`)
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
            The <code>flights</code> API endpoint on this page is protected by Fingerprint Pro Bot Detection.
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
        ]}
      >
        <Typography variant="h3" className={styles.subHeadline}>
          Search for today&apos;s flights
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1} marginBottom={3}>
            <Grid item xs={12} sm={5.5}>
              <FormControl fullWidth>
                <Autocomplete
                  id="from"
                  size="small"
                  autoHighlight
                  options={AIRPORTS.filter((airport) => airport.code !== to)}
                  getOptionLabel={(option) => `${option.city} (${option.code})`}
                  value={AIRPORTS.find((airport) => airport.code === from)}
                  onChange={(e, value) => setFrom(value?.code ?? '')}
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
                  options={AIRPORTS.filter((airport) => airport.code !== from)}
                  getOptionLabel={(option) => `${option.city} (${option.code})`}
                  value={AIRPORTS.find((airport) => airport.code === to)}
                  onChange={(e, value) => setTo(value?.code ?? '')}
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
              disabled={!to || !from || loading}
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
            <Alert severity={messageSeverity} className="UsecaseWrapper_alert">
              {message}
            </Alert>
          )}
        </form>
        {flights && flights.length > 0 && !loading && (
          <div>
            <Typography variant="h3" className={styles.subHeadline}>
              Found {flights.length} flights
            </Typography>
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