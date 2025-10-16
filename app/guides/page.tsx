import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Parlay Calculator Guides & Tutorials | BuildParlays',
  description: 'Master parlay betting with our comprehensive guides. Learn how to use parlay calculators, understand odds, and build winning NFL parlays with expert strategies.',
  keywords: 'parlay calculator guide, parlay betting tutorial, NFL parlay strategy, parlay odds calculator, sports betting guide',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Parlay Calculator Guides & Tutorials | BuildParlays',
    description: 'Master parlay betting with our comprehensive guides and expert strategies.',
    url: 'https://www.buildparlays.com/guides',
  },
}

export default function GuidesPage() {
  const guideCategories = [
    {
      title: 'Parlay Calculator Category',
      description: 'Complete guide to calculating parlay odds and maximizing sports betting payouts',
      href: '/guides/parlay-calculator-category',
      subPages: [
        { title: 'How Accurate is the Parlay Calculator?', href: '/guides/parlay-calculator-accuracy' },
        { title: 'Beginner\'s Guide to Using a Parlay Calculator', href: '/guides/parlay-calculator-beginner' },
        { title: 'Using a Parlay Calculator with Odds Boosts', href: '/guides/parlay-calculator-odds-boosts' },
        { title: 'Parlay Calculator for Other Sports', href: '/guides/parlay-calculator-other-sports' },
        { title: 'Using a Parlay Calculator for Live NFL Betting', href: '/guides/parlay-calculator-live-nfl' },
        { title: 'Using a Parlay Calculator with Teaser Bets', href: '/guides/parlay-calculator-teaser-bets' },
        { title: 'Using a Parlay Calculator with Round Robin Bets', href: '/guides/parlay-calculator-round-robin' },
        { title: 'Using a Parlay Calculator with Same Game Parlays', href: '/guides/parlay-calculator-same-game' },
        { title: 'Using a Parlay Calculator with Alternate Lines', href: '/guides/parlay-calculator-alternate-lines' },
        { title: 'Using a Parlay Calculator with Futures Bets', href: '/guides/parlay-calculator-futures' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Parlay Calculator Guides & Tutorials
          </h1>
          <p className="text-xl text-gray-600">
            Master the art of parlay betting with our comprehensive guides and expert strategies
          </p>
        </div>

        <div className="grid gap-8">
          {guideCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                <Link href={category.href} className="text-blue-600 hover:text-blue-800">
                  {category.title}
                </Link>
              </h2>
              <p className="text-gray-700 mb-6">
                {category.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {category.subPages.map((subPage, subIndex) => (
                  <div key={subIndex} className="border-l-4 border-blue-500 pl-4 py-2">
                    <Link 
                      href={subPage.href}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {subPage.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Building Winning Parlays?
          </h2>
          <p className="text-gray-700 mb-6">
            Put your knowledge to practice with our AI-powered parlay calculator and expert NFL predictions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 text-center"
            >
              Try Our Parlay Calculator
            </Link>
            <Link 
              href="/schedule"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 text-center"
            >
              View NFL Schedule
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
