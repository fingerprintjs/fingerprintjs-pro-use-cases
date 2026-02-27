import { Event } from '@fingerprint/node-sdk';

const botDetectionResult = ({ event }: { event: Event | undefined }): string => {
  const bot = event?.bot;
  const botType = event?.bot_type;
  switch (bot) {
    case 'good':
      return 'You are a good bot 🤖';
    case 'bad':
      return `You are a bad bot 🤖 (type: ${botType ?? 'unknown'})`;
    case 'not_detected':
      return 'Not detected';
    default:
      return 'Unknown';
  }
};

export default botDetectionResult;
