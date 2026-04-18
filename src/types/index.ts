export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Category =
  | 'Scalability'
  | 'Storage'
  | 'Caching'
  | 'Messaging'
  | 'Search'
  | 'Real-time'
  | 'Infrastructure'
  | 'URL/ID'

export interface Question {
  id: string
  title: string
  prompt: string
  difficulty: Difficulty
  category: Category
  tags: string[]
  modelAnswer: string
  createdAt: string
}

export interface Session {
  id: string
  questionId: string
  answer: string
  aiFeedback: AiFeedback
  score: number
  durationSecs: number
  createdAt: string
}

export interface Progress {
  id: string
  questionId: string
  interval: number
  easeFactor: number
  nextReviewAt: string
  lastScore: number | null
  updatedAt: string
}

export interface AiFeedback {
  score: number
  strengths: string[]
  gaps: string[]
  tip: string
}

export type QuestionStatus = 'not_started' | 'done' | 'due'

export interface QuestionWithStatus extends Question {
  status: QuestionStatus
  nextReviewAt?: string
  lastScore?: number | null
}

export type SelfRating = 'Easy' | 'Hard'
