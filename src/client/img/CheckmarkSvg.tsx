import { ComponentProps, FunctionComponent } from 'react';

export const CheckMarkSvg: FunctionComponent<ComponentProps<'svg'>> = (props) => (
  <svg width='18' height='14' viewBox='0 0 18 14' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M6.00016 11.1701L1.83016 7.00009L0.410156 8.41009L6.00016 14.0001L18.0002 2.00009L16.5902 0.590088L6.00016 11.1701Z'
      fill='currentColor'
    />
  </svg>
);
