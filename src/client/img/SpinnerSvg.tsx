import { FunctionComponent, ComponentProps } from 'react';

export const SpinnerSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='62' height='61' viewBox='0 0 62 61' fill='none' {...props}>
    <path
      d='M60.2812 30.5C60.2813 37.2744 57.9323 43.8392 53.6347 49.0758C49.3371 54.3125 43.3567 57.897 36.7125 59.2186C30.0683 60.5402 23.1714 59.5172 17.1969 56.3238C11.2225 53.1303 6.54009 47.9642 3.94765 41.7055C1.35521 35.4467 1.01309 28.4828 2.97959 22.0001C4.94609 15.5174 9.09952 9.91717 14.7322 6.15353C20.3649 2.38989 27.1283 0.695743 33.8701 1.35975C40.6118 2.02375 46.9148 5.00482 51.705 9.79503'
      stroke='url(#paint0_angular_1885_45347)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <defs>
      <radialGradient
        id='paint0_angular_1885_45347'
        cx='0'
        cy='0'
        r='1'
        gradientUnits='userSpaceOnUse'
        gradientTransform='translate(30.3843 30.4413) rotate(-21.5953) scale(32.0766 32.0646)'
      >
        <stop stopColor='white' />
        <stop offset='1' stopColor='#FA7545' />
      </radialGradient>
    </defs>
  </svg>
);
