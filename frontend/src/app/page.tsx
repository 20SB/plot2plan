import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered House Design Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your dream home into reality with our intelligent design system.
              Get professional architectural drawings in minutes, not months.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="btn btn-secondary text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold mb-2">2D Floor Plans</h3>
              <p className="text-gray-600">
                Professional naksha with accurate measurements and room layouts
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">3D Visualizations</h3>
              <p className="text-gray-600">
                See your home come to life with stunning 3D renders
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Technical Drawings</h3>
              <p className="text-gray-600">
                Complete electrical, plumbing, and structural plans
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">Enter Details</h4>
                <p className="text-sm text-gray-600">
                  Provide plot size, room requirements, and preferences
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">AI Processing</h4>
                <p className="text-sm text-gray-600">
                  Our AI generates optimized designs for your needs
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Review & Refine</h4>
                <p className="text-sm text-gray-600">
                  Make adjustments and customize to your liking
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-2">Download</h4>
                <p className="text-sm text-gray-600">
                  Get all drawings ready for construction
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 House Design Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
