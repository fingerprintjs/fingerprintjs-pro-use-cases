import { FC } from 'react';
import styles from './InputTextWithUnits.module.scss';

interface TextInputProps {
  prefix?: string;
  suffix?: string;
  value?: number;
  onChange?: (value: number) => void;
}

export const InputNumberWithUnits: FC<TextInputProps> = ({ prefix, suffix, value, onChange }) => {
  return (
    <div className={styles.container}>
      {prefix && <div>{prefix}</div>}
      <input
        className={styles.input}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {suffix && <div>{suffix}</div>}
    </div>
  );
};
