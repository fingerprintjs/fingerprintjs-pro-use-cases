import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import FlightCard from '../../client/components/web-scraping/FlightCard';
import { useVisitorData } from '../../client/use-visitor-data';

export const WebScrapingUseCase = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  /**
   * @type {[import('../../client/components/web-scraping/FlightCard').Flight[], React.Dispatch<import('../../client/components/web-scraping/FlightCard').Flight[]>]}
   */
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  // Don't invoke query on mount
  const visitorDataQuery = useVisitorData({ enabled: false });

  /**
  //* @type {React.FormEventHandler<HTMLFormElement>}
  //*/
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const { data } = await visitorDataQuery.refetch();
    try {
      const results = await (
        await fetch(`/api/web-scraping/flights?from=${from}&to=${to}&requestId=${data.requestId}`)
      ).json();
      setLoading(false);
      setMessage(results.message);
      setFlights(results.data.flights);
    } catch (error) {
      setLoading(false);
      setMessage(error.toString());
      console.log(error);
    }
  }

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
        <h1>Search for today&apos;s flights</h1>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <InputLabel id="from">From</InputLabel>
            <Select labelId="from" id="from-select" value={from} label="From" onChange={(e) => setFrom(e.target.value)}>
              <MenuItem value={'San Francisco'}>San Francisco</MenuItem>
              <MenuItem value={'New York'}>New York</MenuItem>
              <MenuItem value={'London'}>London</MenuItem>
              <MenuItem value={'Tokyo'}>Tokyo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="to">To</InputLabel>
            <Select labelId="to" id="to-select" value={to} label="To" onChange={(e) => setTo(e.target.value)}>
              <MenuItem value={'San Francisco'}>San Francisco</MenuItem>
              <MenuItem value={'New York'}>New York</MenuItem>
              <MenuItem value={'London'}>London</MenuItem>
              <MenuItem value={'Tokyo'}>Tokyo</MenuItem>
            </Select>
            {
              <Button type="submit" size="large" variant="contained" color="primary" disableElevation fullWidth>
                Search flights
              </Button>
            }
            {loading && <Typography>Loading...</Typography>}
            {message}
          </FormControl>
        </form>
        {flights?.length > 0 && (
          <div>
            <h2>Results</h2>
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
