import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {ArrowLeft, Play, Calendar, User, Layers, RefreshCw, CheckCircle2, XCircle, Clock, Loader2, AlertCircle,ChevronDown, ChevronUp, FileText,} from 'lucide-react'
import { getAudit, runAudit, updateCheck, getAuditFromStore, ApiError } from '../services/api'
import type { Audit, Check } from '../types'
import { Badge, Button, ProgressBar, Card, ErrorState, Toast } from '../components/ui'
import clsx from 'clsx'

/**
 * Función de formateo de fecha
 * @param iso 
 * @returns 
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Función de formateo de horas
 * @param iso 
 * @returns 
 */
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}


export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>() // Obtenemos el id de la auditoría de la URL
  const navigate = useNavigate()

  // Estado principal de la auditoría, cuando se carga
  const [audit, setAudit] = useState<Audit | null>(null)
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado secundario mientras se está ejecutando
  const [running, setRunning] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPolling = useRef(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Carga de la auditoría
  const fetchAudit = useCallback(async () => {
    if (!id) return
    if (!isPolling.current) setLoading(true)
    setError(null)
    try {
      const { audit: a, checks: c } = await getAudit(id) // llamamos a la API simulada
      setAudit(a)
      setChecks(c)
    } catch (err) {
      // Si es un error conocido de la API usa su mensaje, si no mensaje genérico
      setError(err instanceof ApiError ? err.message : 'Error cargando auditoría')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  // Polling when audit is IN_PROGRESS
  useEffect(() => {
    if (audit?.status === 'IN_PROGRESS') {
      pollingRef.current = setInterval(() => {
        isPolling.current = true
        if (!id) return
        // Use direct store access for polling (no error simulation)
        const { audit: a, checks: c } = getAuditFromStore(id)
        if (a) {
          setAudit({ ...a })
          setChecks([...c])
        }
        isPolling.current = false
      }, 800)
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [audit?.status, id])

  // Lanzar ejecución de la auditoría
  async function handleRun() {
    if (!id) return
    setRunning(true)
    try {
      await runAudit(id)
      showToast('Ejecución iniciada correctamente', 'success')
      fetchAudit()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Error al iniciar ejecución', 'error')
    } finally {
      setRunning(false)
    }
  }

  // Evaluación manual de un control
  async function handleManualResult(checkId: string, result: 'OK' | 'KO') {
    if (!id || !audit) return
    // Optimistic update
    setChecks((prev) =>
      prev.map((c) => c.id === checkId ? { ...c, status: result, updatedAt: new Date().toISOString() } : c)
    )
    try {
      await updateCheck(id, checkId, { status: result })
      // Refresh audit progress
      const { audit: a } = getAuditFromStore(id)
      if (a) setAudit({ ...a })
    } catch (err) {
      // Rollback
      setChecks((prev) =>
        prev.map((c) => c.id === checkId ? { ...c, status: 'PENDING' } : c)
      )
      showToast('Error al actualizar el control', 'error')
    }
  }

  // Mensaje de error con opción de reintentar
  if (loading) return <AuditDetailSkeleton />

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState message={error} onRetry={fetchAudit} />
      </div>
    )
  }

  // En caso de no haber auditoria ni error 
  if (!audit) return null

  // Variables globales según el estado de la auditoría
  const doneChecks = checks.filter((c) => c.status === 'OK' || c.status === 'KO').length
  const totalChecks = checks.length
  const koChecks = checks.filter((c) => c.status === 'KO').length
  const isExecuting = audit.status === 'IN_PROGRESS' && checks.some((c) => c.status === 'QUEUED' || c.status === 'RUNNING')

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Botón para volver a la vista de auditorías */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} />} onClick={() => navigate('/audits')}>
          Auditorías
        </Button>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge value={audit.status} />
            <span className="text-xs text-sand-400">·</span>
            <span className="text-xs text-sand-400">{audit.process}</span>
          </div>
          <h1 className="font-serif text-3xl text-sand-900 leading-tight">{audit.name}</h1>
        </div>
        {audit.status !== 'DONE' && (
          <Button
            icon={isExecuting ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            onClick={handleRun}
            loading={running}
            disabled={isExecuting}
            className="flex-shrink-0"
          >
            {isExecuting ? 'Ejecutando…' : 'Ejecutar auditoría'}
          </Button>
        )}
      </div>

      {/* Tarjetas de resumen de auditoría que se está viendo*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={<User size={15} className="text-blue-500" />} label="Responsable" value={audit.owner.name} />
        <SummaryCard icon={<Calendar size={15} className="text-blue-500" />} label="Fecha límite" value={formatDate(audit.targetDate)} />
        <SummaryCard
          icon={<CheckCircle2 size={15} className="text-sage-500" />}
          label="Controles"
          value={`${doneChecks} / ${totalChecks}`}
          sub={koChecks > 0 ? `${koChecks} con incidencia` : undefined}
        />
        <SummaryCard
          icon={<Layers size={15} className="text-blue-500" />}
          label="Progreso"
          value={`${audit.progress}%`}
          progress={audit.progress}
        />
      </div>

      {/* Barra de progreso para cuando se está ejecutando una auditoría */}
      {isExecuting && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">Ejecución en curso…</p>
              <ProgressBar value={audit.progress} className="mt-1.5" />
            </div>
            <span className="text-sm font-semibold text-blue-700">{audit.progress}%</span>
          </div>
        </Card>
      )}

      {/* Tarjeta para indicar cuando se ejecutó la auditoría
          Solo se muestra cuando el estado de la auditoría es Hecho */}
      {audit.status === 'DONE' && (
        <Card className="p-4 mb-4 bg-sage-50 border-sage-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-sage-600 flex-shrink-0" />
            <p className="text-sm font-medium text-sage-800">
              Auditoría completada el {formatDate(audit.updatedAt)} a las {formatTime(audit.updatedAt)}
            </p>
          </div>
        </Card>
      )}

      {/* Tarjeta para indicar el número controles que no fueron pasados con éxito */}
      {audit.status === 'BLOCKED' && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
            <p className="text-sm font-medium text-blue-800">
              La auditoría tiene {koChecks} control{koChecks !== 1 ? 'es' : ''} con incidencia. Revisa los resultados.
            </p>
          </div>
        </Card>
      )}

      {/* Listado de controles de la auditoría */}
      <Card>
        <div className="px-5 py-4 border-b border-[#e8e4dc] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sand-900">Controles de evaluación</h2>
            <p className="text-xs text-sand-500 mt-0.5">{totalChecks} controles · {doneChecks} completados</p>
          </div>
        </div>

        {/* Si no hay controles */}
        {checks.length === 0 ? (
          <div className="py-12 text-center text-sand-400 text-sm">
            Sin controles definidos
          </div>
        ) : (
          <div className="divide-y divide-[#e8e4dc]">
            {checks.map((check) => (
              <CheckRow
                key={check.id}
                check={check}
                auditStatus={audit.status}
                onManualResult={handleManualResult}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * Función para mostrar las 4 tarjetas de resumen de la auditoria (responsable, fecha, progreso y numero de controles que tiene)
 * @param param0 
 * @returns 
 */
function SummaryCard({
  icon, label, value, sub, progress,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; progress?: number
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-sand-500 font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-sand-900">{value}</p>
      {sub && <p className="text-xs text-blue-600 mt-0.5">{sub}</p>}
      {progress !== undefined && <ProgressBar value={progress} className="mt-2" />}
    </Card>
  )
}

/**
 * Función que renderiza cada fila de los controles asociados a una auditoría
 * @param param0 
 * @returns 
 */
function CheckRow({
  check, auditStatus, onManualResult,
}: {
  check: Check
  auditStatus: Audit['status']
  onManualResult: (id: string, result: 'OK' | 'KO') => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [evidence, setEvidence] = useState(check.evidence)
  const canManuallyRespond = auditStatus === 'IN_PROGRESS' && (check.status === 'PENDING')

  const statusIcon: Record<Check['status'], React.ReactNode> = {
    PENDING: <Clock size={14} className="text-sand-400" />,
    QUEUED: <Clock size={14} className="text-amber-500 animate-pulse-soft" />,
    RUNNING: <Loader2 size={14} className="text-blue-500 animate-spin" />,
    OK: <CheckCircle2 size={14} className="text-sage-600" />,
    KO: <XCircle size={14} className="text-blue-600" />,
  }

  return (
    <div className={clsx('transition-colors', check.status === 'KO' && 'bg-blue-50/30')}>
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-sand-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0">{statusIcon[check.status]}</div>
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-sm font-medium',
            check.status === 'KO' ? 'text-blue-800' :
            check.status === 'OK' ? 'text-sage-800' :
            'text-sand-900'
          )}>
            {check.title}
          </p>
        </div>
        <Badge value={check.priority} size="xs" />
        <Badge value={check.status} size="xs" />
        {canManuallyRespond && (
          <div className="flex items-center gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onManualResult(check.id, 'OK')}
              className="text-xs px-2 py-1 rounded-md bg-sage-100 text-sage-700 hover:bg-sage-200 border border-sage-200 font-medium transition-colors"
            >
              OK
            </button>
            <button
              onClick={() => onManualResult(check.id, 'KO')}
              className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 font-medium transition-colors"
            >
              KO
            </button>
          </div>
        )}
        <button className="text-sand-400 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Menú que se expande cuando se selecciona una fila
        Sirve para añadir notas a un determinado contro*/}
      {expanded && (
        <div className="px-5 pb-4 bg-sand-50/50 animate-fade-in border-t border-[#e8e4dc]/50">
          <div className="pt-3 space-y-3">
            <div>
              <label className="text-xs font-semibold text-sand-500 uppercase tracking-wider block mb-1.5">
                Evidencia
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Añade notas o evidencias del control…"
                rows={2}
                className="w-full text-sm rounded-lg border border-[#e8e4dc] px-3 py-2 bg-white placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <p className="text-xs text-sand-400">
              Actualizado: {formatDate(check.updatedAt)} · {formatTime(check.updatedAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Función que renderiza la vista de detalles en bloques grises
 * Simula que la página está cargando obteniendo datos
 * @returns 
 */
function AuditDetailSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="skeleton h-4 w-24 mb-6 rounded" />
      <div className="skeleton h-8 w-80 mb-2 rounded" />
      <div className="skeleton h-4 w-48 mb-6 rounded" />
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 skeleton rounded-xl" />
        ))}
      </div>
      <div className="h-64 skeleton rounded-xl" />
    </div>
  )
}
