import { LayoutUI } from './LayoutUI';
import Providers from './Providers';

export const metadata = {
  title: 'Fingerprint Pro Use Cases',
  description:
    'Explore the wide range of major use cases supported by Fingerprint, including a comprehensive demo that showcases both frontend and backend sample implementations with a persistent data layer for each use case.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <LayoutUI>{children}</LayoutUI>
        </Providers>
      </body>
    </html>
  );
}
