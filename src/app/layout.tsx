import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '설계공모 AI - 상주시 시니어복합센터',
  description: '상주시 시니어복합센터 건립사업 설계공모 AI 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full overflow-hidden bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
