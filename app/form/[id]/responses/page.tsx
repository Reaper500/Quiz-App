'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Form, FormResponse } from '@/types/form'
import { useStorage } from '@/lib/storage'
import { ArrowLeft, Download, FileText, Share2, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function ResponsesPage() {
  const params = useParams()
  const formId = params.id as string
  const storage = useStorage()
  const form = storage.getForm(formId)
  const responses = storage.getResponses(formId)
  const isLoading = form === undefined || responses === undefined
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const formUrl = `${window.location.origin}/form/${formId}`
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = formUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  const exportToCSV = () => {
    if (!form || !responses || responses.length === 0) return

    const headers = ['Submission Date', ...form.fields.map(f => f.label)]
    const rows = responses.map(response => {
      const date = formatDate(response.submittedAt)
      const values = form.fields.map(field => {
        const value = response.responses[field.id]
        if (Array.isArray(value)) {
          return value.join('; ')
        }
        if (value instanceof File) {
          return value.name
        }
        return value || ''
      })
      return [date, ...values]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title}_responses.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading responses...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/form/${formId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Form</span>
            </Link>
            <div className="flex items-center gap-3">
              {responses && responses.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Share Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Share this Quiz</h3>
              <p className="text-xs text-gray-600">Students can take this quiz without logging in</p>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-[300px] max-w-md">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/form/${formId}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.title} - Responses
          </h1>
          <p className="text-gray-600 mb-4">
            {responses?.length || 0} response{(responses?.length || 0) !== 1 ? 's' : ''}
          </p>
          {form.isQuiz && responses && responses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Quiz Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Average Score</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {responses.length > 0 
                      ? Math.round(
                          responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length
                        ) 
                      : 0}
                    / {form.fields.filter(f => f.isQuiz).reduce((sum, f) => sum + (f.points || 1), 0)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Average %</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {responses.length > 0 && responses[0].maxScore
                      ? Math.round(
                          (responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length / responses[0].maxScore) * 100
                        )
                      : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Highest Score</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...responses.map(r => r.score || 0))} / {responses[0]?.maxScore || 0}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Lowest Score</div>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.min(...responses.map(r => r.score || 0))} / {responses[0]?.maxScore || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No responses yet
            </h2>
            <p className="text-gray-600 mb-6">
              Share your form link with students to start collecting responses. Students can take the quiz without logging in.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Share Link
                  </>
                )}
              </button>
              <Link
                href={`/form/${formId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Form
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div
                key={response.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Response #{index + 1}
                    </h3>
                    {form.isQuiz && response.score !== undefined && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium text-gray-700">
                          Score: {response.score} / {response.maxScore || 0}
                        </span>
                        {response.maxScore && response.maxScore > 0 && (
                          <span className="text-gray-500 ml-2">
                            ({Math.round((response.score / response.maxScore) * 100)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(response.submittedAt)}
                  </span>
                </div>

                <div className="space-y-4">
                  {form.fields.map((field) => {
                    if (field.type === 'textblock') return null
                    
                    const value = response.responses[field.id]
                    const answerResult = response.answers?.[field.id]
                    const isCorrect = answerResult?.isCorrect
                    
                    return (
                      <div 
                        key={field.id}
                        className={`p-4 rounded-lg border-2 ${
                          field.isQuiz && answerResult
                            ? isCorrect
                              ? 'bg-green-50 border-green-300'
                              : 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-900">
                            {field.label}
                          </label>
                          {field.isQuiz && answerResult && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              isCorrect 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'} 
                              {answerResult.points !== undefined && ` (${answerResult.points}/${field.points || 1} pts)`}
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-2">
                          <div className="text-sm text-gray-600 mb-1">Student's Answer:</div>
                          <div className="text-gray-900 font-medium">
                            {value === undefined || value === null || value === '' ? (
                              <span className="text-gray-400 italic">No response</span>
                            ) : Array.isArray(value) ? (
                              <ul className="list-disc list-inside space-y-1">
                                {value.map((item, i) => {
                                  const isCorrectOption = field.isQuiz && field.correctAnswers?.includes(item)
                                  return (
                                    <li key={i} className={isCorrectOption ? 'text-green-700 font-bold' : 'text-red-700'}>
                                      {item}
                                      {isCorrectOption && ' ✓'}
                                    </li>
                                  )
                                })}
                              </ul>
                            ) : value instanceof File ? (
                              <span className="text-blue-600">{value.name}</span>
                            ) : (
                              <span className={field.isQuiz && !isCorrect ? 'text-red-700' : ''}>{String(value)}</span>
                            )}
                          </div>
                        </div>
                        
                        {field.isQuiz && field.correctAnswers && field.correctAnswers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="text-sm font-semibold text-gray-700 mb-1">
                              Correct Answer{field.correctAnswers.length > 1 ? 's' : ''}:
                            </div>
                            <div className="text-green-700 font-medium">
                              {field.correctAnswers.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
