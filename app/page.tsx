import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">
          The Story Teller
        </h1>
        <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
          A structured approach to AI-assisted narrative creation with comprehensive schema management
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 text-white font-semibold"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 bg-transparent border border-white/30 hover:bg-white/10 rounded-lg transition-colors duration-200 font-semibold"
          >
            Learn More
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl w-full">
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-3">Schema-Driven</h2>
          <p>Standardized structures for all narrative elements ensuring consistency and quality.</p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-3">AI-Optimized</h2>
          <p>Specially designed prompts and workflows for working with AI assistants.</p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-3">Comprehensive</h2>
          <p>Track relationships between all narrative objects with detailed metadata.</p>
        </div>
      </div>
    </main>
  )
}