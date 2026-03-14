export type FieldType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'file'
  | 'rating'
  | 'textblock' // For descriptive text sections

export interface FormField {
  id: string
  type: FieldType
  label: string
  description?: string // Help text or description below the question
  placeholder?: string
  required?: boolean
  options?: string[] // For radio, checkbox, select
  isQuiz?: boolean // Whether this is an objective question with correct answers
  correctAnswers?: string[] // Correct answers for quiz questions
  points?: number // Points for this question (default: 1)
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface Form {
  id: string
  title: string
  description?: string
  isQuiz?: boolean // Whether this form is a quiz/test
  timerMinutes?: number // Timer in minutes for quiz (optional)
  fields: FormField[]
  createdAt: string
  updatedAt: string
}

export interface FormResponse {
  id: string
  formId: string
  responses: Record<string, any>
  submittedAt: string
  score?: number // Total score for quiz responses
  maxScore?: number // Maximum possible score
  answers?: Record<string, {
    isCorrect?: boolean
    points?: number
  }> // Quiz answer results
  studentName?: string // Student's name
  studentClass?: string // Student's class
}
