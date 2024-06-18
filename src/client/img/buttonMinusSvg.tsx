import { ComponentProps, FunctionComponent } from 'react';

export const ButtonMinusSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg width='15' height='16' viewBox='0 0 15 16' stroke='currentColor' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M10.7932 7.66016H7.2501H3.70703' />
  </svg>
);

export const ButtonMinusSvgThin: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='2' viewBox='0 0 14 2' fill='none' {...props}>
    <path d='M14 1H7H0' stroke='currentColor' />
  </svg>
);
