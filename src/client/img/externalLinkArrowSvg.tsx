import { FunctionComponent, ComponentProps } from 'react';

export const ExternalLinkArrowSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' {...props}>
    <path
      d='M3.83399 1H11.334M11.334 1L11.334 8.5M11.334 1L1.33398 11'
      stroke='currentColor'
      strokeLinecap='square'
      strokeLinejoin='round'
    />
  </svg>
);
