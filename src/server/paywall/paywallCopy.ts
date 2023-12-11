export const PAYWALL_COPY = {
  limitReached: 'You have reached your daily view limit, purchase our membership plan to view unlimited articles.',
  lastArticle: 'This is your last free article today.',
  nArticlesRemaining(n: number) {
    return `You have ${n} remaining free article views.`;
  },
} as const;
