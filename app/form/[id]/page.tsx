'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Form, FormResponse } from '@/types/form'
import { useStorage } from '@/lib/storage'
import FieldRenderer from '@/components/FieldRenderer'
import { ArrowLeft, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function FormViewPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  const storage = useStorage()
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submittedResponse, setSubmittedResponse] = useState<FormResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [showQuiz, setShowQuiz] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null) // in seconds
  const [timerStarted, setTimerStarted] = useState(false)
  const [isTimerExpired, setIsTimerExpired] = useState(false)

  // Try to get form from user's forms first (if signed in)
  const userForm = storage.getForm(formId)
  
  // Use public form query as fallback (for public viewing)
  // Only query if formId looks like a valid Convex ID and we don't have it from user's forms
  const shouldQueryPublic = !userForm && formId && formId.length > 10
  const convexForm = useQuery(
    api.forms.getForm,
    shouldQueryPublic ? { id: formId as Id<"forms"> } : "skip"
  )
  
  const form = userForm || (convexForm ? {
    id: convexForm._id,
    title: convexForm.title,
    description: convexForm.description,
    isQuiz: convexForm.isQuiz,
    timerMinutes: convexForm.timerMinutes,
    fields: convexForm.fields,
    createdAt: convexForm.createdAt,
    updatedAt: convexForm.updatedAt,
  } : null)

  const isLoading = !userForm && convexForm === undefined

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/form/[id]/page.tsx:51',message:'useEffect triggered',data:{hasForm:!!form,formIsQuiz:form?.isQuiz,showQuiz,studentName,studentClass},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (form) {
      // If it's a quiz, don't show it until name/class are entered
      // Only set to false if showQuiz hasn't been explicitly set to true by user
      if (form.isQuiz && !showQuiz) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/form/[id]/page.tsx:55',message:'Setting showQuiz to false (isQuiz, initial)',data:{formIsQuiz:form.isQuiz,showQuiz},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setShowQuiz(false)
      } else if (!form.isQuiz) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/form/[id]/page.tsx:58',message:'Setting showQuiz to true (not quiz)',data:{formIsQuiz:form.isQuiz},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setShowQuiz(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  // Timer initialization - start timer when quiz begins
  useEffect(() => {
    if (!form?.isQuiz || !form?.timerMinutes || !showQuiz || timerStarted || isTimerExpired) {
      return
    }

    // Initialize timer when quiz starts
    if (!timerStarted && showQuiz) {
      const totalSeconds = form.timerMinutes * 60
      setTimeRemaining(totalSeconds)
      setTimerStarted(true)
    }
  }, [form, showQuiz, timerStarted, isTimerExpired])

  // Timer countdown logic
  useEffect(() => {
    if (!timerStarted || timeRemaining === null || timeRemaining <= 0 || isTimerExpired) {
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setIsTimerExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerStarted, timeRemaining, isTimerExpired])

  // Auto-submit when timer expires
  useEffect(() => {
    if (isTimerExpired && !isSubmitted && !isSubmitting && form && showQuiz) {
      // Auto-submit the form
      const autoSubmit = async () => {
        // Calculate score if it's a quiz
        const { score, maxScore, answers } = calculateScore(form, responses)

        const formResponse: FormResponse = {
          id: uuidv4(),
          formId: form.id,
          responses,
          submittedAt: new Date().toISOString(),
          score: form.isQuiz ? score : undefined,
          maxScore: form.isQuiz ? maxScore : undefined,
          answers: form.isQuiz ? answers : undefined,
          studentName: form.isQuiz ? studentName.trim() : undefined,
          studentClass: form.isQuiz ? studentClass.trim() : undefined,
        }

        setIsSubmitting(true)
        await storage.saveResponse(formResponse)
        setSubmittedResponse(formResponse)
        setIsSubmitting(false)
        setIsSubmitted(true)
      }

      autoSubmit()
    }
  }, [isTimerExpired, isSubmitted, isSubmitting, form, showQuiz, responses, studentName, studentClass, storage])

  // Helper function to format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses({ ...responses, [fieldId]: value })
  }

  const calculateScore = (form: Form, responses: Record<string, any>) => {
    if (!form.isQuiz) return { score: 0, maxScore: 0, answers: {} }

    let totalScore = 0
    let maxScore = 0
    const answers: Record<string, { isCorrect: boolean; points: number }> = {}

    form.fields.forEach(field => {
      if (!field.isQuiz) return

      const points = field.points || 1
      maxScore += points

      const userAnswer = responses[field.id]
      const correctAnswers = field.correctAnswers || []

      let isCorrect = false

      if (field.type === 'checkbox') {
        // For checkboxes, check if all correct answers are selected and no incorrect ones
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : []
        const correctSet = new Set(correctAnswers)
        const userSet = new Set(userAnswers)
        
        isCorrect = 
          userAnswers.length === correctAnswers.length &&
          correctAnswers.every(ans => userSet.has(ans)) &&
          userAnswers.every(ans => correctSet.has(ans))
      } else if (field.type === 'radio' || field.type === 'select') {
        // For radio/select, check if answer matches any correct answer
        isCorrect = correctAnswers.includes(userAnswer)
      } else {
        // For text fields, check if answer matches (case-insensitive)
        isCorrect = correctAnswers.some(correct => 
          String(userAnswer).toLowerCase().trim() === String(correct).toLowerCase().trim()
        )
      }

      if (isCorrect) {
        totalScore += points
      }

      answers[field.id] = {
        isCorrect,
        points: isCorrect ? points : 0,
      }
    })

    return { score: totalScore, maxScore, answers }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form) return

    // Validate required fields
    const missingFields = form.fields
      .filter(field => field.required && !responses[field.id])
      .map(field => field.label)

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n${missingFields.join('\n')}`)
      return
    }

    setIsSubmitting(true)

    // Calculate score if it's a quiz
    const { score, maxScore, answers } = calculateScore(form, responses)

    const formResponse: FormResponse = {
      id: uuidv4(),
      formId: form.id,
      responses,
      submittedAt: new Date().toISOString(),
      score: form.isQuiz ? score : undefined,
      maxScore: form.isQuiz ? maxScore : undefined,
      answers: form.isQuiz ? answers : undefined,
      studentName: form.isQuiz ? studentName.trim() : undefined,
      studentClass: form.isQuiz ? studentClass.trim() : undefined,
    }

    await storage.saveResponse(formResponse)
    setSubmittedResponse(formResponse)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-4">The form you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (isSubmitted && form) {
    const showResults = form.isQuiz && submittedResponse
    const score = submittedResponse?.score || 0
    const maxScore = submittedResponse?.maxScore || 0
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/forms"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Forms</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Form Submitted Successfully!
              </h1>
              {showResults && (
                <div className="mt-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {score} / {maxScore}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    {percentage}% Correct
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {!showResults && (
              <p className="text-gray-600 text-center mb-6">
                Thank you for your response. Your submission has been recorded.
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>

          {showResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Results</h2>
              <div className="space-y-6">
                {form.fields.map((field) => {
                  if (field.type === 'textblock') return null
                  
                  const userAnswer = responses[field.id]
                  const answerResult = submittedResponse?.answers?.[field.id]
                  const isCorrect = answerResult?.isCorrect || false

                  return (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      value={userAnswer}
                      showResults={true}
                      isCorrect={isCorrect}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/forms"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Forms</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!showQuiz && form.isQuiz && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="student-name"
                  name="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="student-class" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Class *
                </label>
                <input
                  type="text"
                  id="student-class"
                  name="student-class"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your class"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/form/[id]/page.tsx:329',message:'Start Quiz button clicked',data:{studentName:studentName.trim(),studentClass:studentClass.trim(),hasName:!!studentName.trim(),hasClass:!!studentClass.trim(),formIsQuiz:form?.isQuiz,showQuiz},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  // #endregion
                  if (studentName.trim() && studentClass.trim()) {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/69db1d38-4cfc-427c-bac1-c809ff3b8140',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/form/[id]/page.tsx:332',message:'Setting showQuiz to true',data:{studentName:studentName.trim(),studentClass:studentClass.trim()},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    setShowQuiz(true)
                  } else {
                    alert('Please enter your name and class')
                  }
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Quiz
              </button>
            </div>
          </div>
        )}

        {showQuiz && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {form.title}
                </h1>
                {form.isQuiz && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Quiz
                  </span>
                )}
              </div>
              {form.description && (
                <p className="text-gray-600 text-lg">
                  {form.description}
                </p>
              )}
            </div>

            {form.timerMinutes && showQuiz && timeRemaining !== null && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                timeRemaining <= 60 
                  ? 'bg-red-50 border-red-300' 
                  : timeRemaining <= 300 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${
                      timeRemaining <= 60 
                        ? 'text-red-600' 
                        : timeRemaining <= 300 
                        ? 'text-yellow-600' 
                        : 'text-blue-600'
                    }`} />
                    <span className={`font-semibold ${
                      timeRemaining <= 60 
                        ? 'text-red-700' 
                        : timeRemaining <= 300 
                        ? 'text-yellow-700' 
                        : 'text-blue-700'
                    }`}>
                      Time Remaining: {formatTime(timeRemaining)}
                    </span>
                  </div>
                  {timeRemaining <= 60 && (
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Less than 1 minute left!</span>
                    </div>
                  )}
                </div>
                {isTimerExpired && (
                  <div className="mt-2 text-sm text-red-700 font-medium">
                    Time's up! Submitting your quiz...
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {form.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={responses[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Form
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
