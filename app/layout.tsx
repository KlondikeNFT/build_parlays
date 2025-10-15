import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuildParlays - #1 AI Parlay Calculator for NFL Betting | Free Sports Betting Tools',
  description: 'Build winning NFL parlays with our AI-powered calculator. Free parlay builder, odds calculator, and sports betting tools. Get expert NFL predictions and build smarter bets today.',
  keywords: 'parlay calculator, NFL parlays, sports betting, AI predictions, parlay builder, betting odds, NFL betting, sports calculator, parlay legs, betting tools, free parlay calculator, NFL picks, sports analytics',
  authors: [{ name: 'BuildParlays' }],
  creator: 'BuildParlays',
  publisher: 'BuildParlays',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://buildparlays.com',
    title: 'BuildParlays - AI Parlay Calculator for NFL Betting',
    description: 'Build winning NFL parlays with our AI-powered calculator. Free parlay builder, odds calculator, and sports betting tools.',
    siteName: 'BuildParlays',
    images: [
      {
        url: 'https://buildparlays.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BuildParlays - AI Parlay Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildParlays - AI Parlay Calculator for NFL Betting',
    description: 'Build winning NFL parlays with our AI-powered calculator. Free parlay builder and sports betting tools.',
    images: ['https://buildparlays.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://buildparlays.com',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "BuildParlays",
              "description": "AI-powered NFL parlay calculator and sports betting tools",
              "url": "https://buildparlays.com",
              "applicationCategory": "SportsApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI Parlay Calculator",
                "NFL Player Analytics", 
                "Sports Betting Tools",
                "Free Betting Calculator",
                "NFL Predictions"
              ],
              "author": {
                "@type": "Organization",
                "name": "BuildParlays"
              }
            })
          }}
        />
        
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        
        {/* SearchAtlas OTTO Pixel - SEO Optimization */}
        <Script
          id="searchatlas-otto-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.setAttribute('nowprocket', '');
                script.setAttribute('nitro-exclude', '');
                script.type = 'text/javascript';
                script.id = 'sa-dynamic-optimization';
                script.setAttribute('data-uuid', 'dbb69606-524e-4692-9374-e1d7a2f1ad16');
                script.src = 'https://dashboard.searchatlas.com/scripts/dynamic_optimization.js';
                document.head.appendChild(script);
              })();
            `
          }}
        />
      </body>
    </html>
  )
}