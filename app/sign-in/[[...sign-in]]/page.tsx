'use client'

import { SignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const [mounted, setMounted] = useState(false)
  
  // #region agent log
  useEffect(() => {
    setMounted(true)
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:11',message:'Sign-in page mounted',data:{clerkPublishableKey:clerkPublishableKey?.substring(0,20) || 'MISSING',hasKey:!!clerkPublishableKey,currentPath:window.location.pathname},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{})
    
    // Check if SignIn component container exists after a delay
    setTimeout(() => {
      const signInContainer = document.querySelector('[data-clerk-element="sign-in"]') || document.querySelector('.cl-signIn-root')
      fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:15',message:'SignIn component render check',data:{hasContainer:!!signInContainer,bodyChildren:document.body.children.length},timestamp:Date.now(),runId:'run1',hypothesisId:'F'})}).catch(()=>{})
    }, 2000)
    
    // Track all failed resource loads (404s)
    const originalFetch = window.fetch
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).catch((error) => {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown'
        if (url.includes('clerk') || url.includes('sign-in') || url.includes('sign-up')) {
          fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:15',message:'Failed fetch detected',data:{url,error:error.message || String(error)},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{})
        }
        throw error
      })
    }
    
    // Track network errors and JavaScript errors
    const errorHandler = (event: ErrorEvent) => {
      const target = event.target as HTMLElement
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || ''
        if (src && (src.includes('clerk') || src.includes('sign-in') || src.includes('sign-up'))) {
          fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:25',message:'Resource load error',data:{tagName:target.tagName,src,errorMessage:event.message},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{})
        }
      } else {
        // JavaScript error
        fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-in/[[...sign-in]]/page.tsx:32',message:'JavaScript error on sign-in page',data:{errorMessage:event.message,errorSource:event.filename || 'NONE',errorLine:event.lineno || 'NONE',errorCol:event.colno || 'NONE',errorStack:event.error?.stack || 'NONE'},timestamp:Date.now(),runId:'run1',hypothesisId:'E'})}).catch(()=>{})
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
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}
