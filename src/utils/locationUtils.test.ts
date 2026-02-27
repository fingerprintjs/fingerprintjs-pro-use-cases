import { describe, it, expect } from 'vitest';
import { getFlagEmoji, getLocationName, UNKNOWN_LOCATION } from './locationUtils';

describe('getLocationName test', () => {
  it('Should return Unknown in case of undefined ipLocation', () => {
    expect(getLocationName()).toBe(UNKNOWN_LOCATION);
  });

  it('Should return Unknown in case of empty ipLocation', () => {
    expect(getLocationName({})).toBe(UNKNOWN_LOCATION);
  });

  it('Should return only country in case of high accuracyRadius', () => {
    expect(
      getLocationName({
        city_name: 'Columbus',
        country_name: 'United States',
        accuracy_radius: 1000,
      }),
    ).toBe('United States');
  });

  it('Should return only subdivision in case of medium accuracyRadius', () => {
    expect(
      getLocationName({
        accuracy_radius: 100,
        city_name: 'Nova',
        country_name: 'Portugal',
        subdivisions: [
          {
            iso_code: '13',
            name: 'Porto',
          },
        ],
      }),
    ).toBe('Porto, Portugal');
  });

  it('Should return only city in case of other empty params', () => {
    expect(getLocationName({ city_name: 'Berlin', accuracy_radius: 20 })).toBe('Berlin');
  });

  it('Should return city and country in case of empty subdivisions', () => {
    expect(
      getLocationName({
        city_name: 'Columbus',
        country_name: 'United States',
        accuracy_radius: 20,
      }),
    ).toBe('Columbus, United States');
  });

  it('Should return city, country and subdivision', () => {
    expect(
      getLocationName({
        city_name: 'Columbus',
        country_name: 'United States',
        subdivisions: [{ iso_code: 'OH', name: 'Ohio' }],
        accuracy_radius: 20,
      }),
    ).toBe('Columbus, Ohio, United States');
  });

  it('Should return city, country and only first subdivision', () => {
    expect(
      getLocationName({
        city_name: 'Columbus',
        country_name: 'United States',
        accuracy_radius: 20,
        subdivisions: [
          { iso_code: 'OH', name: 'Ohio' },
          // @ts-ignore Mock test object
          { iso_code: 'FK', name: 'Fake additional subdivision' },
        ],
      }),
    ).toBe('Columbus, Ohio, United States');
  });
});

describe('getFlagEmoji test', () => {
  const testCases = {
    SK: '🇸🇰',
    CZ: '🇨🇿',
    US: '🇺🇸',
    CA: '🇨🇦',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    JP: '🇯🇵',
    BR: '🇧🇷',
    IN: '🇮🇳',
  };
  Object.entries(testCases).forEach(([key, value]) => {
    it(`Should return ${value} for ${key}`, () => {
      expect(getFlagEmoji(key)).toBe(value);
    });
  });
});
