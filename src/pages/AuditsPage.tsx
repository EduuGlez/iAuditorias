import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getAudits, PROCESSES, OWNERS, ApiError } from '../services/api'
import type { Audit, AuditStatus, AuditFilters } from '../types'
import {
  Badge, Button, ProgressBar, Skeleton, SkeletonRow,
  EmptyState, ErrorState, Card,
} from '../components/ui'
import clsx from 'clsx'

const STATUS_OPTIONS: { value: AuditStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'DONE', label: 'Completada' },
  { value: 'BLOCKED', label: 'Bloqueada' },
]

const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'Reciente primero' },
  { value: 'updatedAt_asc', label: 'Más antiguo primero' },
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
  { value: 'targetDate_asc', label: 'Fecha límite ↑' },
  { value: 'progress_desc', label: 'Progreso ↓' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AuditsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Leemos parámetros desde la URL
  const q = searchParams.get('q') ?? ''
  const statusParam = searchParams.getAll('status') as AuditStatus[]
  const process = searchParams.get('process') ?? ''
  const ownerId = searchParams.get('ownerId') ?? ''
  const sort = searchParams.get('sort') ?? 'updatedAt_desc'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = 10

  const [audits, setAudits] = useState<Audit[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Funciones para modificar URL
  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '1')
      return next
    })
  }

  const toggleStatus = (status: AuditStatus) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const current = next.getAll('status')
      next.delete('status')
      if (current.includes(status)) {
        current.filter((s) => s !== status).forEach((s) => next.append('status', s))
      } else {
        [...current, status].forEach((s) => next.append('status', s))
      }
      next.set('page', '1')
      return next
    })
  }

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const hasFilters = q || statusParam.length > 0 || process || ownerId

  // Petición de datos de las auditorías
  const fetchAudits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: AuditFilters = {
        q: q || undefined,
        status: statusParam.length > 0 ? statusParam : undefined,
        process: process || undefined,
        ownerId: ownerId || undefined,
        sort,
        page,
        pageSize,
      }
      const result = await getAudits(filters)
      setAudits(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [q, JSON.stringify(statusParam), process, ownerId, sort, page]) // eslint-disable-line

  useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-sand-900 leading-tight">Auditorías</h1>
          <p className="text-sand-500 text-sm mt-1">
            {loading ? '...' : `${total} auditoría${total !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => navigate('/audits/new')}
        >
          Nueva auditoría
        </Button>
      </div>

      {/* Barra de busqueda y filtros */}
      <Card className="mb-4">
        <div className="flex items-center gap-3 p-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o proceso..."
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-transparent bg-sand-50 hover:border-sand-200 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-sand-400"
            />
          </div>
          {/* Selector de ordenación */}
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="text-sm border border-[#e8e4dc] rounded-lg px-3 py-2 bg-white hover:border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sand-700"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {/* Filtros */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={<SlidersHorizontal size={15} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            {hasFilters && (
              <span className="bg-white/30 text-xs px-1.5 rounded-full -mr-1">
                {[q ? 1 : 0, statusParam.length, process ? 1 : 0, ownerId ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Desplegable con opciones de filtrado */}
        {showFilters && (
          <div className="border-t border-[#e8e4dc] px-4 py-3 bg-sand-50 rounded-b-xl animate-fade-in">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-2">Estado</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => toggleStatus(s.value)}
                      className={clsx(
                        'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                        statusParam.includes(s.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-sand-600 border-[#e8e4dc] hover:border-sand-300'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-2">Proceso</p>
                <select
                  value={process}
                  onChange={(e) => setParam('process', e.target.value)}
                  className="text-sm border border-[#e8e4dc] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los procesos</option>
                  {PROCESSES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-2">Responsable</p>
                <select
                  value={ownerId}
                  onChange={(e) => setParam('ownerId', e.target.value)}
                  className="text-sm border border-[#e8e4dc] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tabla principal con las auditorías */}
      <Card>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_80px] gap-4 px-5 py-3 border-b border-[#e8e4dc] bg-sand-50 rounded-t-xl">
          {['Nombre', 'Proceso', 'Estado', 'Responsable', 'Progreso', ''].map((h) => (
            <span key={h} className="text-xs font-semibold text-sand-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* cargamos filas de la tabla */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAudits} />
        ) : audits.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="No hay auditorías que coincidan con los filtros aplicados."
            action={<Button variant="secondary" size="sm" onClick={clearFilters}>Limpiar filtros</Button>}
          />
        ) : (
          <div className="divide-y divide-[#e8e4dc]">
            {audits.map((audit) => (
              <AuditRow key={audit.id} audit={audit} onClick={() => navigate(`/audits/${audit.id}`)} />
            ))}
          </div>
        )}

        {/* Campo de paginación */}
        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e4dc] rounded-b-xl bg-sand-50">
            <p className="text-xs text-sand-500">
              Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} de {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="xs"
                icon={<ChevronLeft size={14} />}
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              />
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={clsx(
                      'w-7 h-7 text-xs rounded-md font-medium transition-all',
                      page === p
                        ? 'bg-blue-600 text-white'
                        : 'text-sand-600 hover:bg-sand-100'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <Button
                variant="ghost" size="xs"
                icon={<ChevronRight size={14} />}
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * Función que renderiza cada fila de la tabla de auditorías (recibe el id de la auditoría)
 * @param param0 
 * @returns 
 */
function AuditRow({ audit, onClick }: { audit: Audit; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-[2fr_1fr_1fr_1fr_2fr_80px] gap-4 items-center px-5 py-3.5 text-left hover:bg-sand-50 transition-colors group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-sand-900 truncate group-hover:text-blue-600 transition-colors">
          {audit.name}
        </p>
        <p className="text-xs text-sand-400 mt-0.5">
          Actualizada {formatDate(audit.updatedAt)}
        </p>
      </div>
      <span className="text-xs text-sand-600 bg-sand-100 px-2 py-1 rounded-md w-fit">
        {audit.process}
      </span>
      <Badge value={audit.status} />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-semibold text-blue-700">
            {audit.owner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <span className="text-xs text-sand-600 truncate">{audit.owner.name}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <ProgressBar value={audit.progress} className="flex-1" />
        <span className="text-xs text-sand-500 w-8 text-right">{audit.progress}%</span>
      </div>
      <div className="text-xs text-sand-400 text-right">
        {formatDate(audit.targetDate).replace(' de ', ' ')}
      </div>
    </button>
  )
}
