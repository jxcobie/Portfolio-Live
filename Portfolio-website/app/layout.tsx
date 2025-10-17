import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import './globals.css';
import { NavbarProvider } from '../context/NavbarContext';
import AnalyticsProvider from './components/AnalyticsProvider';

// Optimized font loading with display swap
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

// Site configuration
const siteConfig = {
  name: 'Jacob Jaballah | Full-Stack Developer & Automation Expert',
  description:
    'Full-stack developer specializing in Next.js, React, and n8n automation workflows. Building intelligent web applications and automation solutions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jxcobcreations.com',
  author: 'Jacob Jaballah',
  keywords: [
    'Full-stack development',
    'Next.js',
    'React',
    'TypeScript',
    'n8n automation',
    'Web development',
    'API integration',
    'Node.js',
    'PostgreSQL',
    'Tailwind CSS',
    'Framer Motion',
    'Portfolio',
    'Jacob Jaballah',
  ],
  social: {
    twitter: '@jxcobcreations',
    github: 'https://github.com/jacobjaballah',
    linkedin: 'https://linkedin.com/in/jacobjaballah',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.author}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/og-image.png'],
    creator: siteConfig.social.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  category: 'technology',
};

// Structured Data (JSON-LD) for Person schema
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: siteConfig.author,
  url: siteConfig.url,
  image: `${siteConfig.url}/jacob-profile.jpg`,
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  jobTitle: 'Full-Stack Developer & Automation Expert',
  worksFor: {
    '@type': 'Organization',
    name: 'JXCOB Creations',
    url: siteConfig.url,
  },
  knowsAbout: [
    'Full-Stack Development',
    'Next.js',
    'React',
    'TypeScript',
    'Node.js',
    'n8n Automation',
    'API Integration',
    'Web Development',
    'Database Design',
    'UI/UX Design',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sepang',
    addressRegion: 'Selangor',
    addressCountry: 'Malaysia',
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${orbitron.variable} antialiased`}
        suppressHydrationWarning
      >
        <NavbarProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </NavbarProvider>
      </body>
    </html>
  );
}
