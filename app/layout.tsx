import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const googleSansFlex = localFont({
  src: './fonts/google-sans-flex-latin-v1.woff2',
  variable: '--font-google-sans-flex',
  weight: '100 1000',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

const notoSansSC = localFont({
  src: './fonts/noto-sans-sc-spark-v1.woff2',
  variable: '--font-noto-sans-sc',
  weight: '100 900',
  display: 'swap',
  fallback: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
});

const geistMono = localFont({
  src: './fonts/geist-mono-latin-v1.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});

export function generateMetadata(): Metadata {
  const siteOrigin = process.env.SITE_URL ?? 'http://localhost:3001';
  const title = '光点计划 IV｜让对系统的好奇，有地方发生。';
  const description =
    '光点计划 IV 面向对计算机系统感兴趣的校内同学。2026 年设 OS 与 RDMA 两个方向，学习材料分别为 rCore 与 RDMA101。';

  return {
    metadataBase: new URL(siteOrigin),
    title,
    description,
    icons: { icon: '/favicon.svg?v=3' },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      title,
      description,
      images: [
        {
          url: new URL('/og.png', siteOrigin),
          width: 1672,
          height: 941,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [new URL('/og.png', siteOrigin)],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${googleSansFlex.variable} ${notoSansSC.variable} ${geistMono.variable} antialiased`}
        style={
          {
            '--font-google-sans-flex': googleSansFlex.style.fontFamily,
            '--font-noto-sans-sc': notoSansSC.style.fontFamily,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
