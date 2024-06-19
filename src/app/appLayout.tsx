'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { Layout } from '../Layout';

export default function LayoutUiInsideApp({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  return <Layout embed={Boolean(segments?.includes('embed'))}>{children}</Layout>;
}
