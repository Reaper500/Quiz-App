'use client'

import { SignUp } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false)
  
  // #region agent log
  useEffect(() => {
    setMounted(true)
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-up/[[...sign-up]]/page.tsx:11',message:'Sign-up page mounted',data:{clerkPublishableKey:clerkPublishableKey?.substring(0,20) || 'MISSING',hasKey:!!clerkPublishableKey,currentPath:window.location.pathname},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{})
    
    // Check if SignUp component container exists after a delay
    setTimeout(() => {
      const signUpContainer = document.querySelector('[data-clerk-element="sign-up"]') || document.querySelector('.cl-signUp-root')
      fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-up/[[...sign-up]]/page.tsx:15',message:'SignUp component render check',data:{hasContainer:!!signUpContainer,bodyChildren:document.body.children.length},timestamp:Date.now(),runId:'run1',hypothesisId:'F'})}).catch(()=>{})
    }, 2000)
    
    // Track JavaScript errors
    const errorHandler = (event: ErrorEvent) => {
      fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/sign-up/[[...sign-up]]/page.tsx:20',message:'JavaScript error on sign-up page',data:{errorMessage:event.message,errorSource:event.filename || 'NONE',errorLine:event.lineno || 'NONE',errorCol:event.colno || 'NONE',errorStack:event.error?.stack || 'NONE'},timestamp:Date.now(),runId:'run1',hypothesisId:'E'})}).catch(()=>{})
    }
    
    window.addEventListener('error', errorHandler, true)
    
    return () => {
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
      <SignUp routing="path" path="/sign-up" />
    </div>
  )
}
