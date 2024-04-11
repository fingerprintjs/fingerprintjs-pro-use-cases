import pppByCountry from './ppp-by-country.json';

export const getRegionalDiscount = (countryCode: string) => {
  const ppp = (pppByCountry as Record<string, number>)[countryCode] ?? 0.8;
  return (1 - ppp) * 100;
};
