import { ChangeEvent, FC } from 'react';
import styles from './InputTextWithUnits.module.scss';

interface TextInputProps {
  prefix?: string;
  suffix?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const InputTextWithUnits: FC<TextInputProps> = ({ prefix, suffix, value, onChange }) => {
  return (
    <div>
      {prefix && <div>{prefix}</div>}
      <input type="text" value={value} onChange={onChange} />
      {suffix && <div>{suffix}</div>}
    </div>
  );
};

export default InputTextWithUnits;
