export const booleanDetectionResult = (value: boolean | undefined, detectedResult: string): string => {
  if (value === undefined) {
    return 'Not available';
  }

  return value ? detectedResult : 'Not detected';
};
