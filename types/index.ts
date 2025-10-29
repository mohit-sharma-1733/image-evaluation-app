export interface User {
  _id?: string
  userId: string
  userName: string
  userRole: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Brand {
  _id?: string
  brandId: string
  brandName: string
  brandDescription: string
  style: string
  brandVision: string
  brandVoice: string
  colors: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Prompt {
  _id?: string
  imagePath: string
  prompt: string
  llmModel: string
  channel: "Instagram" | "TikTok" | "LinkedIn" | "Facebook"
  userId: string
  brandId: string
  timestamp: Date
  mediaType: "image" | "video"
  metadata?: {
    width?: number
    height?: number
    fileSize?: number
    duration?: number
    format?: string
    aspectRatio?: string
  }
  user?: User
  brand?: Brand
  evaluation?: Evaluation
  createdAt?: Date
  updatedAt?: Date
}

export interface AgentResult {
  score: number
  reasoning: string
  executionTime: number
  status: "success" | "error" | "timeout"
  error?: string
  details?: Record<string, any>
}

export interface Evaluation {
  _id?: string
  promptId: string
  evaluatedBy: string
  evaluatedAt: Date
  agents: {
    sizeComplianceAgent: AgentResult
    subjectAdherenceAgent: AgentResult
    creativityAgent: AgentResult
    moodConsistencyAgent: AgentResult
  }
  finalScore: number
  aggregationFormula: string
  totalExecutionTime: number
  status: "pending" | "completed" | "failed"
  error?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Admin {
  _id?: string
  username: string
  email: string
  password: string
  role: "admin"
  createdAt?: Date
  lastLogin?: Date
  updatedAt?: Date
}

export interface EvaluationData {
  imagePath: string
  prompt: string
  llmModel: string
  channel: string
  brand: Brand
  metadata?: {
    width?: number
    height?: number
    fileSize?: number
    duration?: number
    format?: string
    aspectRatio?: string
  }
}

export interface FilterOptions {
  channel?: string
  brandId?: string
  sortBy?: "date" | "score"
  order?: "asc" | "desc"
  page?: number
  limit?: number
}
