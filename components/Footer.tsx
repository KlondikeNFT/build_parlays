import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              BuildParlays
            </h3>
            <p className="text-gray-300 mb-4">
              AI-powered NFL parlay calculator and sports betting tools. Build winning parlays with expert predictions and data-driven insights.
            </p>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/schedule" className="text-gray-300 hover:text-white transition-colors">
                Schedule
              </Link>
              <Link href="/teams" className="text-gray-300 hover:text-white transition-colors">
                Teams
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white transition-colors">
                  Player Search
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-gray-300 hover:text-white transition-colors">
                  NFL Teams
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-gray-300 hover:text-white transition-colors">
                  NFL Schedule
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/guides" className="text-gray-300 hover:text-white transition-colors">
                  Betting Guides
                </Link>
              </li>
              <li>
                <Link href="/guides/parlay-calculator-category" className="text-gray-300 hover:text-white transition-colors">
                  Parlay Calculator Guide
                </Link>
              </li>
              <li>
                <Link href="/guides/parlay-calculator-beginner" className="text-gray-300 hover:text-white transition-colors">
                  Beginner&apos;s Guide
                </Link>
              </li>
              <li>
                <Link href="/guides/parlay-calculator-accuracy" className="text-gray-300 hover:text-white transition-colors">
                  Calculator Accuracy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 BuildParlays. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
