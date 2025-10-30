import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About BuildParlays',
  description: 'Learn about BuildParlays and our mission.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About BuildParlays</h1>
        <p className="text-gray-700">BuildParlays provides AI-powered parlay tools and NFL analytics.</p>
      </div>
    </div>
  )
}


