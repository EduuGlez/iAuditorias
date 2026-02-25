import clsx from 'clsx'
import { AlertCircle, RefreshCw, Inbox, Loader2 } from 'lucide-react'


type BadgeVariant = 'draft' | 'in_progress' | 'done' | 'blocked' | 'pending' | 'queued' | 'running' | 'ok' | 'ko' | 'low' | 'medium' | 'high'

const badgeClasses: Record<BadgeVariant, string> = {
  draft: 'bg-sand-100 text-sand-600 border-sand-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  done: 'bg-sage-50 text-sage-700 border-sage-200',
  blocked: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-sand-100 text-sand-500 border-sand-200',
  queued: 'bg-amber-50 text-amber-700 border-amber-200',
  running: 'bg-blue-50 text-blue-700 border-blue-200',
  ok: 'bg-sage-50 text-sage-700 border-sage-200',
  ko: 'bg-blue-50 text-blue-700 border-blue-200',
  low: 'bg-sand-100 text-sand-500 border-sand-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  high: 'bg-blue-50 text-blue-600 border-blue-200',
}

const badgeLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
  BLOCKED: 'Bloqueada',
  PENDING: 'Pendiente',
  QUEUED: 'En cola',
  RUNNING: 'Ejecutando',
  OK: 'OK',
  KO: 'KO',
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

/**
 * Etiqueta de colores para mostrar estados y prioridades. 
 * Recibe un value como "IN_PROGRESS" o "HIGH"y traduce el texto con badgeLabels
 * @param param0 
 * @returns 
 */
export function Badge({ value, size = 'sm' }: { value: string; size?: 'xs' | 'sm' }) {
  const key = value.toLowerCase() as BadgeVariant
  const classes = badgeClasses[key] ?? 'bg-sand-100 text-sand-600 border-sand-200'
  const label = badgeLabels[value] ?? value

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border rounded-full leading-none',
        size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        classes
      )}
    >
      {/*Si el valor es Runing parpadea*/}
      {value === 'RUNNING' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse-soft" />
      )}
      {label}
    </span>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const btnBase = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const btnVariants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-soft',
  secondary: 'bg-white text-sand-800 border border-[#e8e4dc] hover:bg-sand-50 hover:border-sand-300 shadow-soft',
  ghost: 'text-sand-600 hover:text-sand-900 hover:bg-sand-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const btnSizes = {
  xs: 'text-xs px-2.5 py-1.5',
  sm: 'text-sm px-3.5 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

/**
 * 
 * @param param0 Botones
 * @returns 
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(btnBase, btnVariants[variant], btnSizes[size], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}

/**
 * Barra de progreso que se ajusta al color
 * @param param0
 * @returns 
 */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const color = value === 100 ? 'bg-sage-500' : value === 0 ? 'bg-sand-300' : 'bg-blue-500'
  return (
    <div className={clsx('h-1.5 bg-sand-200 rounded-full overflow-hidden', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500 ease-out', color)}
        style={{ width: `${Math.max(value, 0)}%` }}
      />
    </div>
  )
}

/**
 * Placeholders que se muestra mientras se cargan los datos
 * @param param0 
 * @returns 
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 px-5 border-b border-[#e8e4dc] last:border-0">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <div className="ml-auto flex items-center gap-3">
        <Skeleton className="h-1.5 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

/**
 * Pantalla para cuando no se encuentran resultados
 * @param param0 
 * @returns 
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-sand-100 border border-[#e8e4dc] flex items-center justify-center mb-4">
        <Inbox size={24} className="text-sand-400" />
      </div>
      <h3 className="font-serif text-xl text-sand-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-sand-500 max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}

/**
 * Pantalla de error
 * @param param0 
 * @returns 
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-blue-500" />
      </div>
      <h3 className="font-serif text-xl text-sand-800 mb-1">Algo salió mal</h3>
      <p className="text-sm text-sand-500 max-w-sm mb-5">
        {message ?? 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}


export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-[#e8e4dc] shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

/**
 * Campo de texto
 * @param param0 
 * @returns 
 */
export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-sand-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-lg border text-sm transition-all bg-white placeholder:text-sand-400',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0',
            icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5',
            error
              ? 'border-blue-400 focus-visible:ring-blue-400'
              : 'border-[#e8e4dc] focus-visible:border-blue-400 hover:border-sand-300',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-blue-600">{error}</p>}
    </div>
  )
}


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

/**
 * Campo para desplegables
 * @param param0 
 * @returns 
 */
export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-sand-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full rounded-lg border text-sm transition-all bg-white appearance-none px-3 py-2.5',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0',
          error
            ? 'border-blue-400'
            : 'border-[#e8e4dc] focus-visible:border-blue-400 hover:border-sand-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-blue-600">{error}</p>}
    </div>
  )
}

/**
 * Notificaciones flotantes en la esquina inferior
 * @param param0 
 * @returns 
 */
export function Toast({
  message,
  type = 'info',
  onClose,
}: {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
}) {
  const styles = {
    success: 'bg-sage-700 text-white',
    error: 'bg-blue-700 text-white',
    info: 'bg-sand-900 text-white',
  }

  return (
    <div
      className={clsx(
        'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevated text-sm font-medium animate-slide-up',
        styles[type]
      )}
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
          ✕
        </button>
      )}
    </div>
  )
}
