import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface to-background opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight">
              <span className="block">Innovation</span>
              <span className="block text-accent">Engineered</span>
            </h1>

            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
              Transforming ideas into reality through 3D printing, custom manufacturing,
              and cutting-edge digital solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/shop"
                className="px-8 py-4 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-all hover:scale-105"
              >
                Explore Products
              </Link>
              <Link
                href="/custom-3d-printing"
                className="px-8 py-4 glass-strong rounded-xl font-semibold hover:bg-surface-elevated transition-all"
              >
                Custom Manufacturing
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-text-secondary">
              Comprehensive solutions for modern manufacturing and development
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 3D Printing Products */}
            <Link href="/shop" className="group glass p-8 rounded-2xl hover:bg-surface-elevated transition-all hover:scale-105">
              <div className="text-4xl mb-4">🖨️</div>
              <h3 className="text-2xl font-bold mb-3">3D Printed Products</h3>
              <p className="text-text-secondary">
                High-quality 3D printed items produced at scale. Browse our diverse catalog.
              </p>
            </Link>

            {/* Custom 3D Printing */}
            <Link href="/custom-3d-printing" className="group glass p-8 rounded-2xl hover:bg-surface-elevated transition-all hover:scale-105">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold mb-3">Custom 3D Printing</h3>
              <p className="text-text-secondary">
                Bring your designs to life. Upload your files and get a custom quote instantly.
              </p>
            </Link>

            {/* Web Development */}
            <Link href="/web-development" className="group glass p-8 rounded-2xl hover:bg-surface-elevated transition-all hover:scale-105">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold mb-3">Web Development</h3>
              <p className="text-text-secondary">
                Custom websites built with modern technologies. Professional, fast, and beautiful.
              </p>
            </Link>

            {/* App Development */}
            <Link href="/app-development" className="group glass p-8 rounded-2xl hover:bg-surface-elevated transition-all hover:scale-105">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-3">App Development</h3>
              <p className="text-text-secondary">
                AI-driven mobile and web applications. Innovation meets functionality.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* MotoRev Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">🏍️</div>
            <h2 className="text-5xl font-bold mb-6">
              Meet <span className="text-accent">MotoRev</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Our flagship mobile app for motorcycle enthusiasts. Track rides, connect with riders,
              and manage your garage - all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/motorev"
                className="px-8 py-4 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-all"
              >
                Learn More
              </Link>
              <a
                href="https://motorevapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 glass-strong rounded-xl font-semibold hover:bg-surface-elevated transition-all"
              >
                Visit MotoRev →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why 47 Industries?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">Fast Turnaround</h3>
              <p className="text-text-secondary">
                Quick production times without compromising on quality
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-2xl font-bold mb-3">Premium Quality</h3>
              <p className="text-text-secondary">
                Industry-leading materials and precision manufacturing
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3">Expert Support</h3>
              <p className="text-text-secondary">
                Dedicated team to help bring your vision to life
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-text-secondary">
              Whether you need custom 3D printing, a new website, or a cutting-edge app,
              we're here to help.
            </p>
            <Link
              href="/contact"
              className="inline-block px-12 py-5 bg-accent text-white rounded-xl text-lg font-semibold hover:bg-accent/90 transition-all hover:scale-105"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
