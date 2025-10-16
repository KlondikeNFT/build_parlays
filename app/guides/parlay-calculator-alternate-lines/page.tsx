import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Using a Parlay Calculator with Alternate Lines | BuildParlays Guide',
  description: 'Learn how to use parlay calculators with alternate lines in NFL betting. Discover strategies for alternate spreads, totals, and maximizing value.',
  keywords: 'alternate lines parlay calculator, NFL alternate lines, alternate spread calculator, betting alternate lines',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Using a Parlay Calculator with Alternate Lines | BuildParlays Guide',
    description: 'Learn how to use parlay calculators with alternate lines in NFL betting.',
    url: 'https://www.buildparlays.com/guides/parlay-calculator-alternate-lines',
  },
}

export default function ParlayCalculatorAlternateLinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/guides" className="hover:text-blue-600">Guides</Link> / 
            <Link href="/guides/parlay-calculator-category" className="hover:text-blue-600 ml-2">Parlay Calculator Category</Link> / 
            <span className="ml-2">Alternate Lines</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Using a Parlay Calculator with Alternate Lines
          </h1>
          <p className="text-xl text-gray-600">
            Master alternate line betting and learn how to use parlay calculators to find the best value in NFL alternate spreads and totals.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Alternate Lines?</h2>
          
          <p className="text-gray-700 mb-6">
            Alternate lines allow you to bet on different point spreads or totals than the main line offered by sportsbooks. These alternative options often provide better odds but require your team to win by a larger margin or for the total to be higher or lower than the standard line.
          </p>

          <div className="bg-blue-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calculate Your Alternate Line Parlays</h2>
            <p className="text-gray-700 mb-6">
              Use our parlay calculator to compare alternate line combinations and find the best value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 text-center"
              >
                Try Our Calculator
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
    </div>
  )
}
