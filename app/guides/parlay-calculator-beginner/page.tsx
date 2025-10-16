/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Beginner&apos;s Guide to Using a Parlay Calculator | BuildParlays',
  description: 'Complete beginner\'s guide to using parlay calculators. Learn the basics of parlay betting, how to input odds, and master your first parlay calculations.',
  keywords: 'parlay calculator beginner, how to use parlay calculator, parlay betting basics, parlay calculator tutorial',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Beginner&apos;s Guide to Using a Parlay Calculator | BuildParlays',
    description: 'Complete beginner\'s guide to using parlay calculators and parlay betting basics.',
    url: 'https://www.buildparlays.com/guides/parlay-calculator-beginner',
  },
}

export default function ParlayCalculatorBeginnerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/guides" className="hover:text-blue-600">Guides</Link> / 
            <Link href="/guides/parlay-calculator-category" className="hover:text-blue-600 ml-2">Parlay Calculator Category</Link> / 
            <span className="ml-2">Beginner&apos;s Guide</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beginner&apos;s Guide to Using a Parlay Calculator
          </h1>
          <p className="text-xl text-gray-600">
            New to parlay betting? This comprehensive guide will teach you everything you need to know about using parlay calculators effectively.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Parlay Calculator?</h2>
          
          <p className="text-gray-700 mb-6">
            A parlay calculator is a tool that helps you determine the potential payout for a parlay bet by combining multiple individual bets into a single wager. It calculates the combined odds and shows you exactly how much you could win if all your selections are correct.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Components You Need to Know</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Legs</h4>
                <p className="text-gray-700">Individual bets that make up your parlay (minimum 2 legs required)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Stake</h4>
                <p className="text-gray-700">The amount of money you&apos;re willing to risk on the parlay</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Odds</h4>
                <p className="text-gray-700">The probability and payout ratio for each individual bet</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Step-by-Step Guide to Using a Parlay Calculator</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step 1: Choose Your Bets</h3>
              <p className="text-gray-700">Select 2 or more individual bets you want to combine into a parlay. These can be moneyline bets, point spreads, totals, or prop bets.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step 2: Input the Odds</h3>
              <p className="text-gray-700">Enter the odds for each leg in your preferred format (American, decimal, or fractional). Most calculators support multiple formats.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step 3: Set Your Stake</h3>
              <p className="text-gray-700">Enter the amount you want to bet on the parlay. This will be your total risk amount.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step 4: Review the Results</h3>
              <p className="text-gray-700">The calculator will show you the combined odds, total payout, profit amount, and implied probability of winning.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Beginner Tips for Success</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-green-800 mb-3">Do&apos;s</h4>
              <ul className="text-green-700 space-y-2">
                <li>• Start with 2-3 leg parlays</li>
                <li>• Use small stakes initially</li>
                <li>• Research your selections thoroughly</li>
                <li>• Keep records of your bets</li>
                <li>• Set a bankroll limit</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-red-800 mb-3">Don&apos;ts</h4>
              <ul className="text-red-700 space-y-2">
                <li>• Don&apos;t chase losses with bigger bets</li>
                <li>• Don&apos;t bet more than you can afford</li>
                <li>• Don&apos;t include too many legs</li>
                <li>• Don&apos;t ignore the odds</li>
                <li>• Don&apos;t bet on impulse</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your First Parlay?</h2>
          <p className="text-gray-700 mb-6">
            Now that you understand the basics, try our user-friendly parlay calculator to build your first winning parlay with expert NFL predictions.
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
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
