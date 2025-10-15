'use client';

import { Calculator, Target, TrendingUp, Users, Zap, Shield, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              About BuildParlays
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The #1 AI-powered parlay calculator and sports betting tool for NFL fans. Build smarter bets with data-driven insights.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BuildParlays is your ultimate parlay calculator and NFL betting companion, designed to help you make smarter, more informed betting decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Calculator className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">AI Parlay Calculator</h3>
            </div>
            <p className="text-gray-600">
              Our advanced parlay calculator uses artificial intelligence to analyze NFL player performance, 
              calculate optimal parlay combinations, and predict the likelihood of success for each bet.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Smart Betting Tools</h3>
            </div>
            <p className="text-gray-600">
              From parlay builders to odds calculators, our comprehensive suite of betting tools helps you 
              analyze games, players, and statistics to build winning parlays with confidence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics</h3>
            </div>
            <p className="text-gray-600">
              Get live NFL statistics, player performance data, and game analysis updated in real-time 
              to ensure your parlay calculations are based on the most current information available.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BuildParlays?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with comprehensive NFL data to deliver the most accurate parlay predictions available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Predictions</h3>
                <p className="text-gray-600">
                  Our artificial intelligence analyzes thousands of data points to predict player performance 
                  and calculate the most likely outcomes for your parlays.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Free Tools</h3>
                <p className="text-gray-600">
                  Unlike other parlay calculators that charge subscription fees, all our betting tools 
                  and AI predictions are completely free to use.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Data</h3>
                <p className="text-gray-600">
                  Access detailed player statistics, team performance metrics, injury reports, 
                  and historical data to make informed betting decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User-Friendly Interface</h3>
                <p className="text-gray-600">
                  Our intuitive parlay builder and calculator interface makes it easy for both beginners 
                  and experienced bettors to create winning combinations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Grade</h3>
                <p className="text-gray-600">
                  Built with the same data sources used by professional sportsbooks, ensuring 
                  accuracy and reliability in all our calculations and predictions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  Our parlay calculator and betting tools update in real-time as games progress, 
                  keeping you informed with the latest odds and statistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Betting Tools</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you&apos;re building a simple 2-leg parlay or a complex 8-leg combination, our tools have you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parlay Calculator</h3>
            <p className="text-gray-600 text-sm">
              Calculate parlay odds, payouts, and probabilities instantly with our advanced calculator.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parlay Builder</h3>
            <p className="text-gray-600 text-sm">
              Build custom parlays with our intuitive builder that suggests optimal combinations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Odds Calculator</h3>
            <p className="text-gray-600 text-sm">
              Convert between different odds formats and calculate implied probabilities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">NFL Analytics</h3>
            <p className="text-gray-600 text-sm">
              Deep dive into player stats, team performance, and game analysis for smarter bets.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Our Parlay Calculator Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI analyzes multiple factors to help you build the most profitable parlays possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Collection</h3>
            <p className="text-gray-600">
              We gather real-time NFL statistics, player performance data, injury reports, 
              weather conditions, and historical trends from professional data sources.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
            <p className="text-gray-600">
              Our artificial intelligence processes thousands of data points to identify patterns, 
              calculate probabilities, and predict the most likely outcomes for each game.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Recommendations</h3>
            <p className="text-gray-600">
              Based on the analysis, we provide you with optimized parlay suggestions, 
              calculated odds, and probability assessments to maximize your betting success.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">The Ultimate Parlay Calculator Experience</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              BuildParlays is the premier destination for NFL parlay betting enthusiasts. Our advanced <strong>parlay calculator</strong> 
              combines cutting-edge artificial intelligence with comprehensive NFL data to deliver the most accurate predictions available. 
              Whether you&apos;re a seasoned bettor or new to <strong>parlay betting</strong>, our platform provides all the tools you need to succeed.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Why Our Parlay Calculator Stands Out</h3>
            <p className="text-gray-600 mb-6">
              Unlike traditional <strong>parlay calculators</strong> that simply multiply odds, our AI-powered system analyzes player performance, 
              team statistics, injury reports, weather conditions, and historical trends to provide intelligent parlay suggestions. 
              Our <strong>free parlay calculator</strong> gives you access to the same analytical tools used by professional sports bettors.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Building Winning Parlays</h3>
            <p className="text-gray-600 mb-6">
              Our <strong>parlay builder</strong> makes it easy to create custom betting combinations. Simply select your desired <strong>parlay legs</strong>, 
              and our calculator will instantly compute the total odds, potential payout, and probability of success. 
              Whether you&apos;re building a simple 2-leg parlay or a complex 8-leg combination, our tools adapt to your betting strategy.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">NFL Betting Made Simple</h3>
            <p className="text-gray-600 mb-6">
              From <strong>NFL parlays</strong> to individual game bets, our platform covers all aspects of football betting. 
              Our <strong>sports betting calculator</strong> helps you understand odds, calculate payouts, and make informed decisions. 
              With real-time updates and comprehensive NFL statistics, you&apos;ll always have the latest information at your fingertips.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Free Tools, Professional Results</h3>
            <p className="text-gray-600 mb-6">
              All our betting tools are completely free to use. Our <strong>odds calculator</strong>, <strong>parlay calculator</strong>, 
              and NFL analytics platform provide professional-grade insights without any subscription fees. 
              We believe that every bettor deserves access to the best tools and information available.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Better Parlays?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of NFL fans who trust BuildParlays for their betting decisions. Start building smarter parlays today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teams"
              className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Explore Teams
            </Link>
            <Link
              href="/search"
              className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-lg"
            >
              Search Players
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-yellow-50 border-y border-yellow-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm md:text-base text-gray-700">
            <span className="font-semibold">Disclaimer:</span> BuildParlays has no affiliation with any casino or sportsbook organizations. 
            All predictions and tools are for informational and entertainment purposes only. Please gamble responsibly.
          </p>
        </div>
      </section>
    </div>
  );
}
