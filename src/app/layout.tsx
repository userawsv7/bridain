import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { GlobalChat } from '@/components/GlobalChat';

export const metadata: Metadata = {
  title: '🧠 Bridain - Play While You Learn',
  description: 'AI-Powered Learning Simulator for DevOps, AI, MLOps & More',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
        <GlobalChat />
      </body>
    </html>
  );
}