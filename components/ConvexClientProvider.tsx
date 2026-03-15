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
    const isServer = typeof window === 'undefined'
    
    // Only create client if we have a valid Convex URL
    if (!isValidConvexUrl(convexUrl)) {
      if (!isServer) {
        console.warn('NEXT_PUBLIC_CONVEX_URL is not set or invalid. Convex features will not work.')
      }
      
      // During SSR/build, we need to provide a provider to prevent hook errors
      // Use a valid format URL that won't cause parsing errors but won't connect
      // This allows the build to complete and hooks to be called safely
      if (isServer) {
        // For SSR, use a valid format that won't crash during build
        // This URL format is valid but won't actually connect
        return new ConvexReactClient('https://build-time-placeholder.convex.cloud')
      }
      
      // On client-side, return null so error boundary can catch it
      return null
    }
    
    try {
      // convexUrl is guaranteed to be defined here due to isValidConvexUrl check
      return new ConvexReactClient(convexUrl!)
    } catch (error) {
      console.error('Failed to initialize Convex client:', error)
      // During SSR, still provide a client to prevent build failures
      if (isServer) {
        return new ConvexReactClient('https://build-time-placeholder.convex.cloud')
      }
      return null
    }
  }, [])

  // Always render ConvexProvider to prevent hook errors during SSR
  // The client will be a placeholder during build if URL is missing
  if (!client) {
    // Only skip provider on client-side if URL is missing
    // This allows error boundary to catch and show configuration message
    return <>{children}</>
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
