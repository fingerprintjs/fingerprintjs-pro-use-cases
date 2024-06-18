import { ComponentProps, FunctionComponent } from 'react';

export const CopyButtonSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='18' viewBox='0 0 16 18' fill='none' {...props}>
    <path
      d='M1.35195 4.11521C1.35195 3.99571 1.44883 3.89883 1.56834 3.89883H12.432C12.5515 3.89883 12.6484 3.99571 12.6484 4.11521V16.4827C12.6484 16.6022 12.5515 16.6991 12.432 16.6991H1.56834C1.44883 16.6991 1.35195 16.6022 1.35195 16.4827V4.11521Z'
      stroke='currentColor'
      stroke-width='1.2'
    />
    <path
      d='M3.25195 1.29883H7.25082H14.4322C14.8831 1.29883 15.2486 1.66434 15.2486 2.11521V9.29897V13.299'
      stroke='currentColor'
      stroke-width='1.2'
    />
  </svg>
);
