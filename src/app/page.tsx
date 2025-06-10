import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 mt-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  The Social Network for
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {' '}Sneakerheads
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                  Showcase your collection, discover rare kicks, and make offers on any sneaker. 
                  Join the community where every sole tells a story.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-black/20 backdrop-blur-sm">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3">
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 mx-auto flex items-center justify-center">
                  <span className="text-2xl">👟</span>
                </div>
                <h3 className="text-xl font-bold text-white">Digital Locker</h3>
                <p className="text-gray-300">
                  Showcase your collection with a beautiful, organized digital locker. Track value and share your story.
                </p>
              </div>
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 mx-auto flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-white">Make Offers</h3>
                <p className="text-gray-300">
                  Our unique "Make an Offer" feature lets you bid on any sneaker, even ones not for sale.
                </p>
              </div>
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 mx-auto flex items-center justify-center">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-white">Social Discovery</h3>
                <p className="text-gray-300">
                  Follow collectors, discover trending shoes, and connect with the global sneaker community.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800">
        <p className="text-xs text-gray-400">© 2024 SoleFolio. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}