import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Parlay Calculator Guides | BuildParlays',
  description: 'Learn how to use parlay calculators effectively with our comprehensive guides. Master parlay betting strategies and calculations.',
  keywords: 'parlay calculator guides, parlay betting tips, how to use parlay calculator, parlay strategies',
  alternates: {
    canonical: 'https://www.buildparlays.com/guides',
  },
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Parlay Calculator Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master the art of parlay betting with our comprehensive guides and tutorials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Parlay Calculator Basics
            </h2>
            <p className="text-gray-600 mb-4">
              Learn the fundamentals of parlay betting and how to use calculators effectively.
            </p>
            <Link 
              href="/guides/parlay-calculator-category" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Guide
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Advanced Strategies
            </h2>
            <p className="text-gray-600 mb-4">
              Discover advanced parlay betting strategies and optimization techniques.
            </p>
            <Link 
              href="/guides/parlay-calculator-category" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Coming Soon
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
