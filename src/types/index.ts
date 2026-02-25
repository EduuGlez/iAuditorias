// Fichero que define los tipos de datos de la aplicación

export type AuditStatus = 'DRAFT' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export interface Owner {
  id: string
  name: string
  avatar?: string
}

export interface Audit {
  id: string
  name: string
  process: string
  status: AuditStatus
  progress: number
  owner: Owner
  targetDate: string
  updatedAt: string
  createdAt: string
  templateId: string
}

export type CheckStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'OK' | 'KO'
export type CheckPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Check {
  id: string
  title: string
  priority: CheckPriority
  status: CheckStatus
  evidence: string
  reviewed: boolean
  updatedAt: string
}

export interface CheckPreview {
  title: string
  priority: CheckPriority
}

export interface Template {
  id: string
  name: string
  process: string
  checkCount: number
  checksPreview: CheckPreview[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface AuditFilters {
  q?: string
  status?: AuditStatus[]
  process?: string
  ownerId?: string
  sort?: string
  page?: number
  pageSize?: number
}

export interface CreateAuditPayload {
  name: string
  process: string
  owner: Owner
  targetDate: string
  templateId: string
}

export interface RunResponse {
  runId: string
  auditId: string
}
