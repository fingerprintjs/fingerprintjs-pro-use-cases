import classNames from 'classnames';
import { FunctionComponent } from 'react';
import styles from './cart.module.scss';
import { ButtonMinusSvg } from '../../../img/buttonMinusSvg';
import { ButtonPlusSvg } from '../../../img/buttonPlusSvg';
import Image from 'next/image';

const format$ = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export type CartProduct = {
  id: number | string;
  name: string;
  subheadline: string;
  price: number;
  image: any;
  count: number;
  increaseCount: () => void;
  decreaseCount: () => void;
};

const Product: FunctionComponent<{ product: CartProduct }> = ({
  product: { name, subheadline, price, image, count, increaseCount, decreaseCount },
}) => {
  return (
    <div className={styles.product}>
      <Image src={image} alt={name} width={92} height={92} />
      <div className={styles.productDescription}>
        <div className={styles.productName}>{name}</div>
        <div className={styles.productSubheadline}>{subheadline}</div>
        <div className={styles.priceAndCount}>
          <div className={styles.price}>{format$(price)}</div>
          <div className={styles.count}>
            <ButtonMinusSvg onClick={decreaseCount} />
            <span>{String(count).padStart(2, '0')}</span>
            <ButtonPlusSvg onClick={increaseCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

type CartProps = {
  items: CartProduct[];
  discount: number;
  taxPerItem: number;
};

export const Cart: FunctionComponent<CartProps> = ({ items, discount, taxPerItem }) => {
  const subTotal = items.reduce((acc, item) => acc + item.price * item.count, 0);
  const totalCount = items.reduce((acc, item) => acc + item.count, 0);
  const discountApplied = (subTotal * discount) / 100;
  const taxesApplied = taxPerItem * totalCount;
  const total = subTotal + taxesApplied - discountApplied;

  return (
    <div className={styles.cartWrapper}>
      {items.map((item) => (
        <Product key={item.id} product={item} />
      ))}

      <div className={styles.summary}>
        <div className={styles.item}>
          <span>Subtotal</span>
          <span>{format$(subTotal)}</span>
        </div>
        <div className={styles.item}>
          <span>Taxes</span>
          <span>{format$(taxesApplied)}</span>
        </div>
        {discount > 0 && (
          <div className={classNames(styles.item, styles.discount)}>
            <span>Coupon Discount {discount}%</span>
            <span>-{format$(discountApplied)}</span>
          </div>
        )}
        <div className={styles.item}>
          <b>Total</b>
          <span>{format$(total)}</span>
        </div>
      </div>
    </div>
  );
};
