export default function AboutPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About 47 Industries</h1>
          <p className="text-xl md:text-2xl text-text-secondary leading-relaxed">
            We're a technology company focused on advanced manufacturing and digital innovation.
            From 3D printing to cutting-edge software development, we build solutions that matter.
          </p>
        </div>

        {/* Mission & What We Do */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="p-8 bg-surface border border-border rounded-2xl">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                To bridge the gap between digital innovation and physical manufacturing, creating
                accessible, high-quality solutions for businesses and individuals.
              </p>
              <p className="text-text-secondary leading-relaxed">
                We believe in the power of technology to transform ideas into reality, whether
                that's a custom 3D printed part, a powerful mobile application, or a comprehensive
                web platform.
              </p>
            </div>

            {/* What We Do */}
            <div className="p-8 bg-surface border border-border rounded-2xl">
              <h2 className="text-3xl font-bold mb-6">What We Do</h2>
              <div className="space-y-6">
                <div className="p-4 bg-background rounded-xl border border-border">
                  <h3 className="font-bold mb-2">3D Printing & Manufacturing</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    From rapid prototyping to production runs, we deliver precision manufacturing at scale.
                  </p>
                </div>
                <div className="p-4 bg-background rounded-xl border border-border">
                  <h3 className="font-bold mb-2">Web Development</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Modern, fast, and secure websites built with cutting-edge technologies.
                  </p>
                </div>
                <div className="p-4 bg-background rounded-xl border border-border">
                  <h3 className="font-bold mb-2">App Development</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Mobile and web applications powered by AI and built for scale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-10 bg-surface border border-border rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-center">
              <p className="text-text-secondary leading-relaxed">
                47 Industries was founded by Bryce Raiford, a visionary who believed in the power of
                technology to transform ideas into reality. Though Bryce tragically passed away on
                December 17, 2022, his spirit and vision continue to drive everything we do.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Today, we carry forward Bryce's legacy by building innovative solutions that make a
                difference. Every project we undertake, every line of code we write, and every product
                we create honors his memory and commitment to excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="p-10 bg-surface border border-border rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold mb-3 text-center">Quality First</h3>
                <p className="text-text-secondary text-sm text-center leading-relaxed">
                  Every project gets the attention and craftsmanship it deserves, no compromises.
                </p>
              </div>
              <div className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold mb-3 text-center">Innovation</h3>
                <p className="text-text-secondary text-sm text-center leading-relaxed">
                  We stay at the forefront of technology to deliver modern solutions.
                </p>
              </div>
              <div className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold mb-3 text-center">Transparency</h3>
                <p className="text-text-secondary text-sm text-center leading-relaxed">
                  Clear communication, honest timelines, and straightforward pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MotoRev */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-10 bg-surface border border-border rounded-2xl">
            <div className="text-center">
              <div className="text-xs font-semibold text-accent mb-4 tracking-wider">FEATURED PROJECT</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">MotoRev</h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
                Our flagship mobile application for motorcycle enthusiasts. MotoRev represents
                everything we stand for: innovation, quality, and user-focused design.
              </p>
              <a
                href="https://motorevapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-text-primary text-background rounded-lg font-medium hover:bg-text-secondary transition-all"
              >
                Learn More About MotoRev
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="p-10 bg-surface border border-border rounded-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Work with us</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Ready to start your project? We'd love to hear from you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-10 py-5 bg-text-primary text-background rounded-lg text-lg font-medium hover:bg-text-secondary transition-all"
            >
              Get in Touch
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'About Us - 47 Industries',
  description: 'Learn about 47 Industries, our mission, and how we combine manufacturing and digital innovation.',
}
