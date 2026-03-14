'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  // Always create a client - use placeholder during build if env var is missing
  // This ensures ConvexProvider is always available for hooks during SSR
  const client = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (convexUrl) {
      return new ConvexReactClient(convexUrl)
    }
    // During build/SSR when env var isn't set, use a placeholder
    // This allows the build to complete, but Convex won't work until env vars are set
    return new ConvexReactClient('https://placeholder.convex.cloud')
  }, [])

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
