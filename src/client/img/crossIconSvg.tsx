import { FunctionComponent, ComponentProps } from 'react';

export const CrossIconSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M2.6665 2.66602L13.3332 13.3327M2.6665 13.3327L13.3332 2.66602'
      stroke='currentColor'
      stroke-opacity='0.6'
      stroke-width='1.2'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
);
