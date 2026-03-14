'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    
    // If URL is missing, use a dummy URL that will fail gracefully
    // This ensures ConvexProvider is always present so hooks don't crash
    // The actual queries will fail, but components should handle undefined results
    if (!convexUrl || convexUrl.includes('placeholder')) {
      if (typeof window !== 'undefined') {
        console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work.')
      }
      // Use a dummy URL - queries will fail but hooks won't crash
      return new ConvexReactClient('https://dummy.convex.cloud')
    }
    
    try {
      return new ConvexReactClient(convexUrl)
    } catch (error) {
      console.error('Failed to initialize Convex client:', error)
      // Return dummy client to prevent hook crashes
      return new ConvexReactClient('https://dummy.convex.cloud')
    }
  }, [])

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
