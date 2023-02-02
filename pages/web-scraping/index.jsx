import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';

export const WebScrapingUseCase = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  /**
   * @type {React.FormEventHandler<HTMLFormElement>}
   */
  function handleSubmit(event) {
    event.preventDefault();
    console.log('Submit', from, to);
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
        <h1>Search for flights</h1>
        <form onSubmit={handleSubmit} className="Form_container">
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
          </FormControl>
          <Button
            size="large"
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            fullWidth
          >
            Search flights
          </Button>
        </form>
      </UseCaseWrapper>
    </>
  );
};

export default WebScrapingUseCase;
