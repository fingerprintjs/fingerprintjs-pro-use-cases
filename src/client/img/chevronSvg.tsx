import { ComponentProps, FunctionComponent } from 'react';

export const ChevronSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8' fill='none' {...props}>
    <path
      d='M0.500479 0.999999L6.32091 6.37371C6.704 6.72739 7.29453 6.72739 7.67761 6.37371L13.498 1'
      stroke='url(#paint0_linear_1639_58018)'
      strokeWidth='1.4'
    />
    <defs>
      <linearGradient
        id='paint0_linear_1639_58018'
        x1='13.498'
        y1='7'
        x2='-0.125573'
        y2='4.68623'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#F5614B' />
        <stop offset='0.0001' stopColor='#F5614B' />
        <stop offset='1' stopColor='#FA7545' />
      </linearGradient>
    </defs>
  </svg>
);
