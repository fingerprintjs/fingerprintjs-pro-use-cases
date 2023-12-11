import { FC } from 'react';
import styles from './InputTextWithUnits.module.scss';

interface NumberInputWithUnitsProps {
  prefix?: string;
  suffix?: string;
  value?: number;
  onChange?: (value: number) => void;
  name?: string;
  dataTestId?: string;
}

export const NumberInputWithUnits: FC<NumberInputWithUnitsProps> = ({
  prefix,
  suffix,
  value,
  onChange,
  name,
  dataTestId,
}) => {
  return (
    <div className={styles.container}>
      {prefix && <div>{prefix}</div>}
      <input
        className={styles.input}
        type="number"
        value={value}
        name={name}
        onChange={(event) => onChange?.(Number(event.target.value))}
        data-testid={dataTestId}
      />
      {suffix && <div>{suffix}</div>}
    </div>
  );
};
