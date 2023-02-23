import { Margin } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import CircleIcon from '@mui/icons-material/Circle';
import { FunctionComponent } from 'react';
import styles from '../../../styles/web-scraping.module.css';

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
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  return (
    <Card style={{ marginTop: '20px' }} variant={'outlined'}>
      <CardContent>
        <div className={styles.container}>
          <div className={styles.place}>
            <Typography>{departure.toLocaleDateString('en-US', dateOptions)}</Typography>
            <Typography>{departure.toLocaleTimeString('en-US', timeOptions)}</Typography>
            <Typography>{flight.from}</Typography>
          </div>
          <div className={styles.middle}>
            <Typography fontSize={'small'} className={styles.duration}>
              {formatTime(duration)}
            </Typography>
            <div className={styles.transition}>
              <div className={styles.circleContainer}>
                <CircleIcon className={styles.circle} />
              </div>
              <div className={styles.line}></div>
              <div className={styles.arrow}>
                <FlightIcon fontSize="small" />
              </div>
              <div className={styles.line}></div>
              <div className={styles.circleContainer}>
                <CircleIcon className={styles.circle} />
              </div>
            </div>
            <Typography fontSize={'small'} className={styles.airline}>
              {flight.airline}
            </Typography>
          </div>
          <div className={styles.place}>
            <Typography>{arrival.toLocaleDateString('en-US', dateOptions)}</Typography>
            <Typography>{arrival.toLocaleTimeString('en-US', timeOptions)}</Typography>
            <Typography>{flight.to}</Typography>
          </div>
        </div>
      </CardContent>
      <CardActions className={styles.actions}>
        <Typography>${flight.price}</Typography>
        <Button variant="outlined">Book flight</Button>
      </CardActions>
    </Card>
  );
};

const HOUR_MS = 3600000;
const MINUTE_MS = 60000;
// convert time in milliseconds to hours and minutes
const formatTime = (time: number) => {
  const hours = Math.floor(time / HOUR_MS);
  const minutes = (time % HOUR_MS) / MINUTE_MS;
  return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
};

export default FlightCard;
