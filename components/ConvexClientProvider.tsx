'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'

function isValidConvexUrl(url: string | undefined): boolean {
  if (!url) return false
  // Valid Convex URLs should contain .convex.cloud or .convex.site
  return url.includes('.convex.cloud') || url.includes('.convex.site')
}

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    
    // Only create client if we have a valid Convex URL
    if (!isValidConvexUrl(convexUrl)) {
      if (typeof window !== 'undefined') {
        console.warn('NEXT_PUBLIC_CONVEX_URL is not set or invalid. Convex features will not work.')
      }
      return null
    }
    
    try {
      // convexUrl is guaranteed to be defined here due to isValidConvexUrl check
      return new ConvexReactClient(convexUrl!)
    } catch (error) {
      console.error('Failed to initialize Convex client:', error)
      return null
    }
  }, [])

  // If no valid client, render children without ConvexProvider
  // This will cause Convex hooks to throw, but that's better than a fatal error
  // Components should handle this gracefully or show an error message
  if (!client) {
    return <>{children}</>
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
