import { Margin } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

export type Flight = {
  from: string;
  to: string;
  departureTime: number;
  arrivalTime: number;
  price: number;
  airline: string;
  flightNumber: string;
};

export type FlightCardProps = {
  flight: Flight;
};

export const FlightCard: FunctionComponent<FlightCardProps> = ({ flight }) => {
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const duration = arrival.getTime() - departure.getTime();
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  return (
    <Card style={{ margin: '20px' }} variant={'outlined'}>
      <CardHeader>
        <Typography>
          {flight.airline} {flight.flightNumber}
        </Typography>
      </CardHeader>
      <CardContent>
        <Typography>
          {flight.from} - {flight.to}
        </Typography>
        <Typography>
          <p>{flight.flightNumber}</p>
          <p>{flight.airline}</p>
          <p>${flight.price}</p>
          <span>🛫 {departure.toLocaleTimeString('en-US', timeOptions)}</span>-
          <span> 🛬 {arrival.toLocaleTimeString('en-US', timeOptions)}</span>
          <br />
          <span>{departure.toLocaleDateString('en-US', {})}</span>-<span>{arrival.toLocaleDateString('en-US')}</span>
          <p>Duration: {formatTime(duration)}</p>
        </Typography>
      </CardContent>
    </Card>
  );
};

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const MINUTE_MS = 60000;
// convert time in milliseconds to hours and minutes
const formatTime = (time: number) => {
  const hours = Math.floor(time / HOUR_MS);
  const minutes = (time % HOUR_MS) / MINUTE_MS;
  return `${hours}h ${minutes}m`;
};

export default FlightCard;
