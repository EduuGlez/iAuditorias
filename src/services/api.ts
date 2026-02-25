import type {
  Audit, AuditFilters, Check, CreateAuditPayload, PaginatedResponse,
  RunResponse, Template,
} from '../types'
import { AUDITS, PROCESSES, CHECKS_MAP, TEMPLATES, OWNERS } from '../data/mockData'

let auditsStore: Audit[] = [...AUDITS]
const checksStore: Record<string, Check[]> = { ...CHECKS_MAP }

// Configuración de latencias
const ERROR_RATE = 0.12 
const MIN_LATENCY = 300
const MAX_LATENCY = 1200

/**
 * Simula latencia de red
 * @param ms 
 * @returns 
 */
function delay(ms?: number): Promise<void> {
  const d = ms ?? MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY)
  return new Promise((resolve) => setTimeout(resolve, d))
}

/**
 * lanza un error aleatorio
 * @param route 
 */
function maybeThrow(route: string): void {
  if (Math.random() < ERROR_RATE) {
    throw new ApiError(`Error simulado en ${route}. Por favor, inténtalo de nuevo.`, 500)
  }
}

/**
 * Error personalizado que añade estado al error HTML
 */
export class ApiError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message)
    this.name = 'ApiError'
  }
}

// Getter de las auditorías
export async function getAudits(filters: AuditFilters = {}): Promise<PaginatedResponse<Audit>> {
  await delay()
  maybeThrow('GET /audits')

  let result = [...auditsStore]

  // Filtro de auditorías
  if (filters.q) {
    const q = filters.q.toLowerCase()
    result = result.filter(
      (a) => a.name.toLowerCase().includes(q) || a.process.toLowerCase().includes(q)
    )
  }
  if (filters.status && filters.status.length > 0) {
    result = result.filter((a) => filters.status!.includes(a.status))
  }
  if (filters.process) {
    result = result.filter((a) => a.process === filters.process)
  }
  if (filters.ownerId) {
    result = result.filter((a) => a.owner.id === filters.ownerId)
  }

  // Ordenación
  const sort = filters.sort ?? 'updatedAt_desc'
  const [field, dir] = sort.split('_')
  result.sort((a, b) => {
    let va: string | number = ''
    let vb: string | number = ''
    if (field === 'name') { va = a.name; vb = b.name }
    else if (field === 'updatedAt') { va = a.updatedAt; vb = b.updatedAt }
    else if (field === 'targetDate') { va = a.targetDate; vb = b.targetDate }
    else if (field === 'progress') { va = a.progress; vb = b.progress }
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })

  // Paginación de las auditorías
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 10
  const start = (page - 1) * pageSize
  const items = result.slice(start, start + pageSize)

  return { items, total: result.length, page, pageSize }
}

/**
 * Busca una auditoría por el id y devuelve sus controles
 * @param id 
 * @returns 
 */
export async function getAudit(id: string): Promise<{ audit: Audit; checks: Check[] }> {
  await delay()
  maybeThrow('GET /audits/:id')

  const audit = auditsStore.find((a) => a.id === id)
  if (!audit) throw new ApiError('Auditoría no encontrada', 404)

  const checks = checksStore[id] ?? []
  return { audit, checks }
}

// Crea una nueva auditoría con estado Borrador por defecto
export async function createAudit(payload: CreateAuditPayload): Promise<Audit> {
  await delay()
  maybeThrow('POST /audits')

  const id = `aud_${Date.now()}`
  const template = TEMPLATES.find((t) => t.id === payload.templateId)

  const audit: Audit = {
    id,
    name: payload.name,
    process: payload.process,
    status: 'DRAFT',
    progress: 0,
    owner: payload.owner,
    targetDate: payload.targetDate,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    templateId: payload.templateId,
  }

  // Genera los controles asociados a la auditoría
  const checkCount = template?.checkCount ?? 15
  const checks: Check[] = Array.from({ length: checkCount }, (_, i) => {
    const preview = template?.checksPreview[i % template.checksPreview.length]
    return {
      id: `chk_${id}_${i + 1}`,
      title: preview?.title ?? `Control ${i + 1}`,
      priority: preview?.priority ?? 'MEDIUM',
      status: 'PENDING',
      evidence: '',
      reviewed: false,
      updatedAt: new Date().toISOString(),
    }
  })

  auditsStore = [audit, ...auditsStore]
  checksStore[id] = checks

  return audit
}

// Ejecución de auditoría. Cambia el estado a INPROGRESS y llama a función que simula la ejecución
export async function runAudit(id: string): Promise<RunResponse> {
  await delay(400)
  maybeThrow('POST /audits/:id/run')

  const auditIdx = auditsStore.findIndex((a) => a.id === id)
  if (auditIdx === -1) throw new ApiError('Auditoría no encontrada', 404)

  auditsStore[auditIdx] = {
    ...auditsStore[auditIdx],
    status: 'IN_PROGRESS',
    updatedAt: new Date().toISOString(),
  }

  // Resetea todos los controles a estado PENDING
  if (checksStore[id]) {
    checksStore[id] = checksStore[id].map((c) => ({
      ...c, status: 'PENDING', updatedAt: new Date().toISOString(),
    }))
  }

  const runId = `run_${Date.now()}`

  simulateExecution(id)

  return { runId, auditId: id }
}

const KO_PROBABILITY = 0.15

/**
 * Función que simula la ejecución de los controles de la auditoría
 * @param auditId 
 * @returns 
 */
async function simulateExecution(auditId: string): Promise<void> {
  const checks = checksStore[auditId]
  if (!checks) return

  for (let i = 0; i < checks.length; i++) {
    // Delay
    await delay(600 + Math.random() * 800)

    // Cola
    updateCheckStatus(auditId, checks[i].id, 'QUEUED')
    await delay(300 + Math.random() * 400)

    // Ejecutandose
    updateCheckStatus(auditId, checks[i].id, 'RUNNING')
    await delay(500 + Math.random() * 700)

    // OK o KO
    const result = Math.random() < KO_PROBABILITY ? 'KO' : 'OK'
    updateCheckStatus(auditId, checks[i].id, result)

    // Actaualizamos el progreso de la ejecución
    updateAuditProgress(auditId)
  }

  // Estado final de la auditoría
  finishAudit(auditId)
}

/**
 * Actualiza los campos de un control de la auditoría
 * @param auditId 
 * @param checkId 
 * @param status 
 * @returns 
 */
function updateCheckStatus(auditId: string, checkId: string, status: Check['status']): void {
  const checks = checksStore[auditId]
  if (!checks) return
  const idx = checks.findIndex((c) => c.id === checkId)
  if (idx === -1) return
  checks[idx] = { ...checks[idx], status, updatedAt: new Date().toISOString() }
}

/**
 * Función que actualiza el progreso de la auditoría
 * @param auditId 
 * @returns 
 */
function updateAuditProgress(auditId: string): void {
  const checks = checksStore[auditId]
  if (!checks) return
  const done = checks.filter((c) => c.status === 'OK' || c.status === 'KO').length
  const progress = Math.round((done / checks.length) * 100)

  const idx = auditsStore.findIndex((a) => a.id === auditId)
  if (idx === -1) return
  auditsStore[idx] = { ...auditsStore[idx], progress, updatedAt: new Date().toISOString() }
}

/**
 * Función que establece el estado final de la auditoría en función de los controles superados
 * @param auditId 
 * @returns 
 */
function finishAudit(auditId: string): void {
  const checks = checksStore[auditId]
  if (!checks) return

  const hasKO = checks.some((c) => c.status === 'KO')
  const idx = auditsStore.findIndex((a) => a.id === auditId)
  if (idx === -1) return

  auditsStore[idx] = {
    ...auditsStore[idx],
    status: hasKO ? 'BLOCKED' : 'DONE',
    progress: 100,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Actualiza los campos de un control
 * @param auditId 
 * @param checkId 
 * @param patch 
 * @returns 
 */
export async function updateCheck(
  auditId: string,
  checkId: string,
  patch: Partial<Pick<Check, 'status' | 'evidence' | 'reviewed'>>
): Promise<Check> {
  await delay(300)
  maybeThrow('PATCH /audits/:id/checks/:checkId')

  const checks = checksStore[auditId]
  if (!checks) throw new ApiError('Auditoría no encontrada', 404)

  const idx = checks.findIndex((c) => c.id === checkId)
  if (idx === -1) throw new ApiError('Check no encontrado', 404)

  checks[idx] = { ...checks[idx], ...patch, updatedAt: new Date().toISOString() }
  updateAuditProgress(auditId)
  finishAudit(auditId)

  return checks[idx]
}

/**
 * Devuelve la lista de plantillas disponibles
 * @returns 
 */
export async function getTemplates(): Promise<Template[]> {
  await delay()
  maybeThrow('GET /templates')
  return [...TEMPLATES]
}

export { OWNERS, PROCESSES }

/**
 * Lectura directa del store sin latencia ni errores. 
 * La usa el polling de la página de detalle para actualizarse cada 800ms sin riesgo de fallos aleatorios durante la ejecución.
 * @param id 
 * @returns 
 */
export function getAuditFromStore(id: string): { audit: Audit | undefined; checks: Check[] } {
  return {
    audit: auditsStore.find((a) => a.id === id),
    checks: checksStore[id] ?? [],
  }
}
