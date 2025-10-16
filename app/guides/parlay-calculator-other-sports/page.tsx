import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Parlay Calculator for Other Sports | BuildParlays Guide',
  description: 'Learn how to use parlay calculators for NBA, MLB, NHL, and other sports. Discover sport-specific strategies and tips for maximizing your parlay success.',
  keywords: 'parlay calculator NBA, MLB parlay calculator, NHL parlay calculator, sports parlay betting',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Parlay Calculator for Other Sports | BuildParlays Guide',
    description: 'Learn how to use parlay calculators for NBA, MLB, NHL, and other sports.',
    url: 'https://www.buildparlays.com/guides/parlay-calculator-other-sports',
  },
}

export default function ParlayCalculatorOtherSportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/guides" className="hover:text-blue-600">Guides</Link> / 
            <Link href="/guides/parlay-calculator-category" className="hover:text-blue-600 ml-2">Parlay Calculator Category</Link> / 
            <span className="ml-2">Other Sports</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Parlay Calculator for Other Sports
          </h1>
          <p className="text-xl text-gray-600">
            Explore how parlay calculators work across different sports and discover sport-specific strategies for NBA, MLB, NHL, and more.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sport-Specific Parlay Strategies</h2>
          
          <p className="text-gray-700 mb-6">
            While the mathematical principles of parlay calculations remain consistent across sports, each sport has unique characteristics that affect parlay strategy and success rates.
          </p>

          <div className="space-y-8">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">NBA Parlays</h3>
              <p className="text-gray-700 mb-4">NBA games offer high-scoring action with many betting opportunities. Consider player props, team totals, and game outcomes for your parlays.</p>
              <ul className="text-gray-700 space-y-2">
                <li>• High variance in player performance</li>
                <li>• Many games per week for opportunities</li>
                <li>• Player props are popular and volatile</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">MLB Parlays</h3>
              <p className="text-gray-700 mb-4">Baseball offers consistent daily action with moneyline and total bets being most popular for parlays.</p>
              <ul className="text-gray-700 space-y-2">
                <li>• Daily games provide many opportunities</li>
                <li>• Weather can affect totals significantly</li>
                <li>• Starting pitcher information is crucial</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">NHL Parlays</h3>
              <p className="text-gray-700 mb-4">Hockey parlays often focus on game outcomes and totals, with lower-scoring games creating different dynamics.</p>
              <ul className="text-gray-700 space-y-2">
                <li>• Lower scoring creates tighter games</li>
                <li>• Goalie performance is crucial</li>
                <li>• Overtime can affect totals and spreads</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Master Multi-Sport Parlays</h2>
          <p className="text-gray-700 mb-6">
            While we specialize in NFL parlays, understanding how parlay calculators work across all sports can enhance your overall betting strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 text-center"
            >
              Try Our NFL Calculator
            </Link>
            <Link 
              href="/guides/parlay-calculator-category"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 text-center"
            >
              Back to Main Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
