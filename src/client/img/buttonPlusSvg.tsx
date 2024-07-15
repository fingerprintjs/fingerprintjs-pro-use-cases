import { FunctionComponent } from 'react';

export const ButtonPlusSvg: FunctionComponent<React.ComponentProps<'svg'>> = (props) => (
  <svg
    width='15'
    height='16'
    viewBox='0 0 15 16'
    stroke='currentColor'
    strokeWidth={1}
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M7.08408 3.81836V7.66014M7.08408 7.66014V11.5019M7.08408 7.66014H10.6271M7.08408 7.66014H3.54102' />
  </svg>
);

export const ButtonPlusSvgThin: FunctionComponent<React.ComponentProps<'svg'>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none' {...props}>
    <path d='M7 0V7M7 7V14M7 7H14M7 7H0' stroke='currentColor' />
  </svg>
);
