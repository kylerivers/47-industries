import { Suspense } from 'react'
import StartProjectClient from './StartProjectClient'

// Force dynamic rendering - uses useSearchParams
export const dynamic = 'force-dynamic'

function StartProjectLoading() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-surface rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-surface rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StartProjectPage() {
  return (
    <Suspense fallback={<StartProjectLoading />}>
      <StartProjectClient />
    </Suspense>
  )
}

export const metadata = {
  title: 'Start Your Project - 47 Industries',
  description: 'Tell us about your web development, app development, or AI project and get a custom proposal.',
}
