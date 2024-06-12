import { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../client/components/common/Accordion/Accordion';
import { FancyNumberedList } from '../../../client/components/common/FancyNumberedList/FancyNumberedList';

type HowTo = {
  title: string;
  content: ReactNode[];
};

const content: HowTo[] = [
  {
    title: 'Incognito mode',
    content: [
      `The you will see a green box with “Not detected” displayed if you’re using a
      normal browser.`,
      `Open this page in incognito mode to see the box change to red with “You are incognito” displayed.`,
    ],
  },
  {
    title: 'VPN Detection',
    content: [
      `If you’re not currently browsing using a VPN, the VPN detection signal will be green with “Not detected” displayed.`,
      <>
        Turn on your VPN service and click <b>Analyze my browser again</b>.
      </>,
      'The VPN detection box will be red with “You are using a VPN”. Additionally, it will recognize that there is a timezone mismatch based on your actual location.',
    ],
  },
  {
    title: 'Browser tampering',
    content: [
      `Right-click on the demo page and select “Inspect” at the bottom of the drop-down menu.`,
      `Under “Dimensions” at the top of the page, select a device that your currently not browsing on. So if you’re currently using a desktop, try selecting a mobile device like iPhone 12 Pro.`,
      <>
        Click <b>Analyze my browser again</b>.
      </>,
      `The browser tampering box will be red with a “Yes” to signify that tampering has been detected.`,
    ],
  },
  {
    title: 'IP Geolocation',
    content: [
      `Notice your location will be displayed by a small map icon. Try taking a trip and refreshing the browser!`,
    ],
  },
];

export function AccordionDemo() {
  return (
    <Accordion type='single' collapsible defaultValue={content[0].title}>
      {content.map(({ title, content }) => (
        <AccordionItem key={title} value={title}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>
            <FancyNumberedList items={content} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
