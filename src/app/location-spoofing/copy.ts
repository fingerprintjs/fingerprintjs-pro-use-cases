export const LOCATION_SPOOFING_COPY = {
  success: ({ discount, country }: { discount: number; country: string }) =>
    `Success! We have applied a regional discount of ${discount}%. With this discount your purchase will be restricted to ${country}.`,
  discountName: 'Regional discount',
  personalizedButton: 'We noticed you are from',
} as const;
