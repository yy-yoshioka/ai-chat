import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Providers from './_components/provider/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat - 顧客サポート革命',
  description: 'AIチャットボットで売上3倍UP、わずか5分で設置完了',
  keywords: ['AI', 'チャットボット', 'カスタマーサポート', 'SaaS'],
  robots: 'index, follow',
  openGraph: {
    title: 'AI Chat - 顧客サポート革命',
    description: 'AIチャットボットで売上3倍UP、わずか5分で設置完了',
    type: 'website',
    locale: 'ja_JP',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
