import { FunctionComponent } from 'react';

type ButtonPlusSvgProps = {
  onClick?: () => void;
};
export const ButtonPlusSvg: FunctionComponent<ButtonPlusSvgProps> = ({ onClick }) => (
  <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick}>
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.08408 3.81836V7.66014M7.08408 7.66014V11.5019M7.08408 7.66014H10.6271M7.08408 7.66014H3.54102"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    ;
  </svg>
);
