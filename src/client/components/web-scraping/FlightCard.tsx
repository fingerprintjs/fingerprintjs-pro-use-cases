import { FunctionComponent } from 'react';
import styles from './FlightCard.module.scss';
import DepartureIcon from '../../img/departure.svg';
import ArrivalIcon from '../../img/arrival.svg';
import AirCanada from '../../img/airCanada.svg';
import Image from 'next/image';
import Button from '../common/Button/Button';
import StarIcon from '../../img/star.svg';
import { TEST_IDS } from '../../e2eTestIDs';

const TEST_ID = TEST_IDS.webScraping;

// convert time in milliseconds to hours and minutes
// const formatDurationTime = (time: number) => {
//   const hours = Math.floor(time / HOUR_MS);
//   const minutes = (time % HOUR_MS) / MINUTE_MS;
//   return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
// };

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
    <>
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
          <span data-test={TEST_ID.airline}>{airline}</span>
        </div>
      </div>
      <div className={styles.flightTimes}>
        <div className={styles.location}>
          <div data-test={TEST_ID.originAirportCode}>{fromCode}</div>
          <div>{fromCity}</div>
        </div>
        <div />
        <div className={styles.location}>
          <div data-test={TEST_ID.destinationAirportCode}>{toCode}</div>
          <div>{toCity}</div>
        </div>
        <div />
        <div className={styles.time} data-test={TEST_ID.departureTime}>
          {formatTime(departureTime)}
        </div>
        <div className={styles.transition}>Direct</div>
        <div className={styles.time} data-test={TEST_ID.arrivalTime}>
          {formatTime(arrivalTime)}
        </div>
        {/* <div>{formatDurationTime(arrivalTime - departureTime)}</div> */}
      </div>
    </>
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
  const taxes = 20;
  const priceTwoAdults = flight.price - taxes;
  const pricePerAdult = priceTwoAdults / 2;
  const total = flight.price;

  return (
    <div className={styles.flightCard} data-test={TEST_ID.card}>
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
      <div className={styles.checkoutContainer}>
        <div>
          <div className={styles.priceLabel}>Price per adult</div>
          <div className={styles.pricePerAdult}>${pricePerAdult}</div>
        </div>
        <div className={styles.priceItems}>
          <div className={styles.priceItem}>
            <span>2 adults</span>
            <span>${priceTwoAdults}</span>
          </div>
          <div className={styles.priceItem}>
            <span>Taxes and charges</span>
            <span>${taxes}</span>
          </div>
        </div>
        <div className={styles.finalPrice}>
          <span>Final price</span>
          <span data-test={TEST_ID.price}>${total}</span>
        </div>
        <div className={styles.line}></div>
        <div className={styles.actions}>
          <div className={styles.favorite}>
            <Image src={StarIcon} alt="Save to favorites" />
          </div>
          <Button size="medium" variant="primary">
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
