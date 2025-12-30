import ServiceInquiryForm from '@/components/ServiceInquiryForm'
import Link from 'next/link'
import { Suspense } from 'react'

export default function ServiceInquiryPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Start Your Project</h1>
          <p className="text-xl text-text-secondary">
            Tell us about your project and we'll provide you with a custom quote within 24 hours.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Suspense fallback={<div className="text-center py-12 text-text-secondary">Loading form...</div>}>
                <ServiceInquiryForm />
              </Suspense>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">What Happens Next?</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Review</div>
                      <div className="text-text-secondary">
                        Our team reviews your project requirements
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Consultation</div>
                      <div className="text-text-secondary">
                        We schedule a call to discuss your needs
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Proposal</div>
                      <div className="text-text-secondary">
                        Receive a detailed quote and timeline
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Build</div>
                      <div className="text-text-secondary">
                        We bring your vision to life
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Contact Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-text-muted mb-1">Email</div>
                    <a href="mailto:contact@47industries.com" className="text-accent hover:underline">
                      contact@47industries.com
                    </a>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1">Business Hours</div>
                    <div className="text-text-secondary">
                      Monday - Friday<br />
                      9:00 AM - 6:00 PM EST
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Looking for Something Else?</h3>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/custom-3d-printing"
                    className="block text-text-secondary hover:text-accent transition-colors"
                  >
                    → 3D Printing Services
                  </Link>
                  <Link
                    href="/services"
                    className="block text-text-secondary hover:text-accent transition-colors"
                  >
                    → View All Services
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-text-secondary hover:text-accent transition-colors"
                  >
                    → General Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Start Your Project - 47 Industries',
  description: 'Get a custom quote for your web development, app development, or AI solution project.',
}
