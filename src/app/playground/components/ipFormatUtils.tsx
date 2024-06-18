import { FunctionComponent } from 'react';

export const FormatIpAddress: FunctionComponent<{ ipAddress?: string }> = ({ ipAddress }) => {
  if (!ipAddress) {
    return null;
  }
  // Check if the string matches the IPv6 address pattern
  const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
  if (!ipv6Regex.test(ipAddress)) {
    return <span>{ipAddress}</span>; // Not a valid IPv6 address, return the original string
  }

  // Insert a line break in the middle of the IPv6 address
  const middleIndex = ipAddress.length / 2;
  const firstHalf = ipAddress.slice(0, middleIndex);
  const secondHalf = ipAddress.slice(middleIndex);

  return (
    <span>
      {firstHalf}
      <br />
      {secondHalf}
    </span>
  );
};
