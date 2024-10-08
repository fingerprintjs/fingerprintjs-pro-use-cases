import * as RadixSlider from '@radix-ui/react-slider';
import styles from './Slider.module.scss';

import React from 'react';

type SliderProps = {
  max?: number;
  min?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  ariaLabel?: string;
  onChange?: (value: number) => void;
};

export const Slider: React.FC<SliderProps> = ({
  max = 100,
  min = 0,
  step = 1,
  defaultValue = 50,
  ariaLabel,
  value,
  onChange,
}) => (
  <RadixSlider.Root
    // Radix slider supports multiple values in one slider, but we are only using one for now
    // So to keep the external API simple, we convert values to arrays and vise-versa
    className={styles.SliderRoot}
    defaultValue={value ? undefined : [defaultValue]}
    max={max}
    min={min}
    step={step}
    value={value ? [value] : undefined}
    onValueChange={(value) => onChange?.(value[0])}
  >
    <RadixSlider.Track className={styles.SliderTrack}>
      <RadixSlider.Range className={styles.SliderRange} />
    </RadixSlider.Track>
    <RadixSlider.Thumb className={styles.SliderThumb} aria-label={ariaLabel} />
  </RadixSlider.Root>
);
