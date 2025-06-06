import { FunctionComponent, ComponentProps } from 'react';

export const RestartSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg
    width='15'
    height='13'
    viewBox='0 0 15 13'
    style={{ strokeWidth: '1.2px' }}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M7.49985 12.5C4.18615 12.5 1.49986 9.81371 1.49986 6.5C1.49986 4.58775 2.39443 2.88443 3.78791 1.78571M7.49985 0.5C10.8136 0.5 13.4998 3.18629 13.4998 6.5C13.4998 8.41225 12.6053 10.1156 11.2118 11.2143M10.9284 8.64286V11.6429H13.9284M1.07129 1.35714H4.07128V4.35714'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
