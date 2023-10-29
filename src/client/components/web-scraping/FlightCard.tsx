import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import { FunctionComponent } from 'react';
import styles from './FlightCard.module.scss';
import { FLIGHT_TAG } from './flightTags';
import { HOUR_MS, MINUTE_MS } from '../../../shared/timeUtils';
import DepartureIcon from '../../img/departure.svg';
import ArrivalIcon from '../../img/arrival.svg';
import AirCanada from '../../img/airCanada.svg';
import Image from 'next/image';

// convert time in milliseconds to hours and minutes
const formatDurationTime = (time: number) => {
  const hours = Math.floor(time / HOUR_MS);
  const minutes = (time % HOUR_MS) / MINUTE_MS;
  return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
};

const formatTime = (time: number) => {
  const date = new Date(time);
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return date.toLocaleTimeString('en-US', timeOptions);
};

type SingleFlightProps = {
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  departureTime: number;
  arrivalTime: number;
  airline: string;
  label: 'Departure' | 'Arrival';
};

const SingleFlight: FunctionComponent<SingleFlightProps> = ({
  fromCity,
  toCity,
  fromCode,
  toCode,
  departureTime,
  arrivalTime,
  airline,
  label,
}) => {
  const departure = new Date(departureTime);
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  return (
    <div className={styles.flight}>
      <div className={styles.generalFlightInfo}>
        <div className={styles.labelDateContainer}>
          <div className={styles.flightLabel}>
            <Image src={label === 'Departure' ? DepartureIcon : ArrivalIcon} alt="" />
            {label}
          </div>
          <div>{departure.toLocaleDateString('en-US', dateOptions)}</div>
        </div>
        <div className={styles.airline}>
          <Image src={AirCanada} alt="" />
          {airline}
        </div>
      </div>
      <div className={styles.flightTimes}>
        <div className={styles.location}>
          <div>{fromCode}</div>
          <div>{fromCity}</div>
        </div>
        <div />
        <div className={styles.location}>
          <div>{toCode}</div>
          <div>{toCity}</div>
        </div>
        <div />
        <div className={styles.time}>{formatTime(departureTime)}</div>
        <div className={styles.transition}>Direct</div>
        <div className={styles.time}>{formatTime(arrivalTime)}</div>
        {/* <div>{formatDurationTime(arrivalTime - departureTime)}</div> */}
      </div>
    </div>
  );
};

export type Flight = {
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  departureTime: number;
  arrivalTime: number;
  returnDepartureTime: number;
  returnArrivalTime: number;
  price: number;
  airline: string;
  flightNumber: string;
};

export type FlightCardProps = {
  flight: Flight;
};

export const FlightCard: FunctionComponent<FlightCardProps> = ({ flight }) => {
  // const departure = new Date(flight.departureTime);
  // const arrival = new Date(flight.arrivalTime);
  // const returnDeparture = new Date(flight.returnDepartureTime);
  // const returnArrival = new Date(flight.returnArrivalTime);
  // const duration = arrival.getTime() - departure.getTime();
  // const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  // const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  return (
    <div className={styles.flightCard}>
      <div className={styles.flightsContainer}>
        <SingleFlight
          fromCity={flight.fromCity}
          toCity={flight.toCity}
          fromCode={flight.fromCode}
          toCode={flight.toCode}
          departureTime={flight.departureTime}
          arrivalTime={flight.arrivalTime}
          airline={flight.airline}
          label="Departure"
        />
        <SingleFlight
          fromCity={flight.toCity}
          toCity={flight.fromCity}
          fromCode={flight.toCode}
          toCode={flight.fromCode}
          departureTime={flight.returnDepartureTime}
          arrivalTime={flight.returnArrivalTime}
          airline={flight.airline}
          label="Arrival"
        />
      </div>
      <div className={styles.checkoutContainer}></div>
    </div>
  );
};

export default FlightCard;

// <Card sx={(theme) => ({ marginTop: theme.spacing(2) })} variant={'outlined'} data-test={FLIGHT_TAG.card}>
//   <CardContent>
//     <div className={styles.container}>
//       <div className={styles.origin} data-test={FLIGHT_TAG.origin}>
//         <Typography fontSize={'small'} className={styles.date}>
//           {departure.toLocaleDateString('en-US', dateOptions)}
//         </Typography>
//         <Typography className={styles.time} data-test={FLIGHT_TAG.time}>
//           {departure.toLocaleTimeString('en-US', timeOptions)}
//         </Typography>
//         <Typography className={styles.city}>{flight.fromCity}</Typography>
//         <Typography
//           className={styles.airportCode}
//           fontSize="small"
//           data-test={FLIGHT_TAG.airportCode}
//         >{`(${flight.fromCode})`}</Typography>
//       </div>
//       <div className={styles.middle}>
//         <Typography fontSize={'small'} className={styles.duration}>
//           {formatTime(duration)}
//         </Typography>
//         <div className={styles.transition}>
//           <div className={styles.circleContainer}>
//             <div className={styles.circle} />
//           </div>
//           <div className={styles.line}></div>
//           <div className={styles.arrow}>
//             <FlightIcon fontSize="small" />
//           </div>
//           <div className={styles.line}></div>
//           <div className={styles.circleContainer}>
//             <div className={styles.circle} />
//           </div>
//         </div>
//         <Typography
//           fontSize={'small'}
//           className={styles.airline}
//           // @ts-ignore
//           sx={(theme) => ({ backgroundColor: theme.palette.headerLight })}
//           data-test={FLIGHT_TAG.airline}
//         >
//           {flight.airline}
//         </Typography>
//       </div>
//       <div className={styles.destination} data-test={FLIGHT_TAG.destination}>
//         <Typography fontSize="small" className={styles.date}>
//           {arrival.toLocaleDateString('en-US', dateOptions)}
//         </Typography>
//         <Typography className={styles.time} data-test={FLIGHT_TAG.time}>
//           {arrival.toLocaleTimeString('en-US', timeOptions)}
//         </Typography>
//         <Typography className={styles.city}>{flight.toCity}</Typography>
//         <Typography
//           className={styles.airportCode}
//           data-test={FLIGHT_TAG.airportCode}
//           fontSize="small"
//         >{`(${flight.toCode})`}</Typography>
//       </div>
//     </div>
//   </CardContent>
//   <CardActions
//     sx={(theme) => ({
//       // @ts-ignore
//       backgroundColor: theme.palette.accentBackground,
//     })}
//     className={styles.actions}
//   >
//     <Button variant="outlined">
//       Book for&nbsp;<span data-test={FLIGHT_TAG.price}>${flight.price}</span>
//     </Button>
//   </CardActions>
// </Card>
