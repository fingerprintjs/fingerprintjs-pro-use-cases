import { Layout } from '../Layout';
import Providers from '../Providers';

// TODO: Fix metadata
export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <Layout embed={false}>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}