'use client'

import { SignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const [mounted, setMounted] = useState(false)
  
  // #region agent log
  useEffect(() => {
    setMounted(true)
    // Check if Clerk is available in window (client-side)
    const clerkAvailable = typeof window !== 'undefined' && !!(window as any).Clerk
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:11',message:'Sign-in page mounted',data:{clerkPublishableKey:clerkPublishableKey?.substring(0,20) || 'MISSING',hasKey:!!clerkPublishableKey,clerkAvailable,currentPath:window.location.pathname},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{})
    
    // Check if SignIn component container exists after a delay
    setTimeout(() => {
      const signInContainer = document.querySelector('[data-clerk-element="sign-in"]') || document.querySelector('.cl-signIn-root')
      fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:15',message:'SignIn component render check',data:{hasContainer:!!signInContainer,bodyChildren:document.body.children.length},timestamp:Date.now(),runId:'run1',hypothesisId:'F'})}).catch(()=>{})
    }, 2000)
    
    // Track all failed resource loads (404s) - enhanced tracking
    const originalFetch = window.fetch
    window.fetch = function(...args) {
      // Handle different types: string, URL, or Request
      let url = 'unknown'
      if (typeof args[0] === 'string') {
        url = args[0]
      } else if (args[0] instanceof URL) {
        url = args[0].toString()
      } else if (args[0] && typeof args[0] === 'object' && 'url' in args[0]) {
        url = (args[0] as Request).url
      }
      return originalFetch.apply(this, args)
        .then((response) => {
          // Track 404 responses
          if (response.status === 404) {
            fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:24',message:'404 response detected',data:{url,status:response.status,statusText:response.statusText},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{})
          }
          return response
        })
        .catch((error) => {
          fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:30',message:'Failed fetch detected',data:{url,error:error.message || String(error)},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{})
          throw error
        })
    }
    
    // Track network errors and JavaScript errors - enhanced to catch ALL 404s
    const errorHandler = (event: ErrorEvent) => {
      const target = event.target as HTMLElement
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')) {
        const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || (target as HTMLImageElement).src || ''
        // Log ALL resource load errors, not just Clerk-related ones
        fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:40',message:'Resource load error',data:{tagName:target.tagName,src,errorMessage:event.message,isClerk:src.includes('clerk') || src.includes('sign-in') || src.includes('sign-up')},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{})
      } else {
        // JavaScript error
        fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:45',message:'JavaScript error on sign-in page',data:{errorMessage:event.message,errorSource:event.filename || 'NONE',errorLine:event.lineno || 'NONE',errorCol:event.colno || 'NONE',errorStack:event.error?.stack || 'NONE'},timestamp:Date.now(),runId:'run1',hypothesisId:'E'})}).catch(()=>{})
      }
    }
    
    // Also track PerformanceObserver for failed network requests
    if ('PerformanceObserver' in window) {
      try {
        const perfObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Type guard for PerformanceResourceTiming
            if ('responseStatus' in entry) {
              const resourceEntry = entry as PerformanceEntry & { responseStatus?: number; name?: string; initiatorType?: string }
              if (resourceEntry.responseStatus === 404 || resourceEntry.responseStatus === 0) {
                fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:57',message:'Performance entry 404',data:{name:resourceEntry.name || 'unknown',responseStatus:resourceEntry.responseStatus,initiatorType:resourceEntry.initiatorType || 'unknown'},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{})
              }
            }
          }
        })
        perfObserver.observe({ entryTypes: ['resource'] })
      } catch (e) {
        // PerformanceObserver might not be supported
      }
    }
    
    window.addEventListener('error', errorHandler, true)
    
    return () => {
      window.fetch = originalFetch
      window.removeEventListener('error', errorHandler, true)
    }
  }, [])
  // #endregion
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SignIn />
    </div>
  )
}
