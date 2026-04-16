import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VideoMaker - 영상 편집기',
  description: '브라우저에서 바로 사용하는 영상 제작 앱',
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
