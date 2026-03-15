'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Upload, Lock, Trash2, Eye, Share2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useStorage } from '@/lib/storage'
import { Form } from '@/types/form'

export default function Home() {
  const router = useRouter()
  const { isSignedIn, user, isLoaded } = useUser()
  const storage = useStorage()
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:16',message:'Clerk useUser hook result',data:{isLoaded,isSignedIn,hasUser:!!user,userId:user?.id || 'NONE',userEmail:user?.emailAddresses?.[0]?.emailAddress || 'NONE'},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{})
    
    // Track Clerk script loading errors
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('clerk')) {
        fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:22',message:'Clerk script loading error detected',data:{errorMessage:event.message,errorSource:event.filename || 'NONE',errorLine:event.lineno || 'NONE',errorCol:event.colno || 'NONE'},timestamp:Date.now(),runId:'run1',hypothesisId:'E'})}).catch(()=>{})
      }
    }, true)
  }, [isLoaded, isSignedIn, user])
  // #endregion
  const forms = storage.getAllForms()
  const isLoading = forms === undefined
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      await storage.deleteForm(id)
    }
  }

  const handleShare = async (formId: string) => {
    const formUrl = `${window.location.origin}/form/${formId}`
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopiedFormId(formId)
      setTimeout(() => setCopiedFormId(null), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = formUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedFormId(formId)
      setTimeout(() => setCopiedFormId(null), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Auth */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              Quiz Builder
            </h1>
            <p className="text-xl text-gray-600">
              Create objective-based quizzes. Upload Word documents with 50+ questions or build manually.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isLoaded && (
              isSignedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 hidden md:block">
                    {user?.emailAddresses[0]?.emailAddress}
                  </span>
                  <UserButton />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/sign-in">
                    <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/sign-up">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <Link
            href="/builder"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Build Manually
              </h2>
              <p className="text-gray-600">
                Create your form step by step with our intuitive drag-and-drop builder
              </p>
            </div>
          </Link>

          <Link
            href="/upload"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-4 mb-4 group-hover:bg-green-200 transition-colors">
                <Upload className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Upload Quiz Document
              </h2>
              <p className="text-gray-600">
                Upload a Word document with objective questions (A, B, C, D) and we'll automatically build your quiz
              </p>
            </div>
          </Link>
        </div>

        {/* Forms List */}
        {isSignedIn && (
          <div className="max-w-6xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Your Forms</h2>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <Lock className="w-5 h-5" />
                Admin Dashboard
              </Link>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading forms...</p>
              </div>
            ) : !forms || forms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No forms yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first form using the options above
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {form.title}
                        </h3>
                        {form.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <FileText className="w-4 h-4" />
                      <span>{form.fields.length} field{form.fields.length !== 1 ? 's' : ''}</span>
                      {form.isQuiz && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Quiz
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      Created: {formatDate(form.createdAt)}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/form/${form.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleShare(form.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Copy shareable link"
                      >
                        {copiedFormId === form.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/form/${form.id}/responses`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Responses
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isSignedIn && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Sign in to create and manage your quizzes
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/sign-in">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
