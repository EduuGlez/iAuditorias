import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Layers, Calendar, User, Briefcase } from 'lucide-react'
import { createAudit, getTemplates, PROCESSES, OWNERS, ApiError } from '../services/api'
import type { Template } from '../types'
import { Button, Input, Select, Card, Badge, ErrorState } from '../components/ui'
import clsx from 'clsx'
import { useEffect } from 'react'

interface Step1Data {
  name: string
  process: string
  ownerId: string
  targetDate: string
}

const STEP_LABELS = ['Datos básicos', 'Selección de plantilla']

export default function CreateAuditPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Step 1
  const [form, setForm] = useState<Step1Data>({ name: '', process: '', ownerId: '', targetDate: '' })
  const [errors, setErrors] = useState<Partial<Step1Data>>({})

  // Step 2
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (step === 1) fetchTemplates()
  }, [step])

  async function fetchTemplates() {
    setTemplatesLoading(true)
    setTemplatesError(null)
    try {
      const data = await getTemplates()
      setTemplates(data)
    } catch (err) {
      setTemplatesError(err instanceof ApiError ? err.message : 'Error cargando plantillas')
    } finally {
      setTemplatesLoading(false)
    }
  }

  function validate(): boolean {
    const e: Partial<Step1Data> = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    if (!form.process) e.process = 'Selecciona un proceso'
    if (!form.ownerId) e.ownerId = 'Selecciona un responsable'
    if (!form.targetDate) e.targetDate = 'La fecha límite es obligatoria'
    else if (new Date(form.targetDate) < new Date()) e.targetDate = 'La fecha debe ser futura'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) setStep(1)
  }

  async function handleSubmit() {
    if (!selectedTemplateId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const owner = OWNERS.find((o) => o.id === form.ownerId)!
      const audit = await createAudit({
        name: form.name,
        process: form.process,
        owner,
        targetDate: form.targetDate,
        templateId: selectedTemplateId,
      })
      navigate(`/audits/${audit.id}`, { replace: true })
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Error al crear la auditoría')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} />} onClick={() => navigate('/audits')}>
          Atrás
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-sand-900">Nueva auditoría</h1>
        <p className="text-sand-500 text-sm mt-1">Completa los pasos para crear una nueva auditoría</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  i < step ? 'bg-blue-600 text-white' :
                  i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  'bg-sand-200 text-sand-400'
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={clsx(
                  'text-sm font-medium',
                  i === step ? 'text-sand-900' : i < step ? 'text-blue-600' : 'text-sand-400'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={clsx('h-px w-16 mx-3', i < step ? 'bg-blue-600' : 'bg-sand-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <Card className="p-6 animate-slide-up">
          <h2 className="font-serif text-xl text-sand-900 mb-5">Datos básicos</h2>
          <div className="space-y-4">
            <Input
              label="Nombre de la auditoría"
              placeholder="Ej: Auditoría ISO 27001 — Compras Q1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              icon={<Briefcase size={15} />}
            />
            <Select
              label="Proceso"
              value={form.process}
              onChange={(e) => setForm({ ...form, process: e.target.value })}
              error={errors.process}
            >
              <option value="">Seleccionar proceso…</option>
              {PROCESSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select
              label="Responsable"
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              error={errors.ownerId}
            >
              <option value="">Seleccionar responsable…</option>
              {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
            <Input
              label="Fecha límite"
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              error={errors.targetDate}
              icon={<Calendar size={15} />}
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext} iconRight={<ArrowRight size={16} />}>
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <div className="animate-slide-up">
          <Card className="p-6 mb-4">
            <h2 className="font-serif text-xl text-sand-900 mb-1">Selección de plantilla</h2>
            <p className="text-sm text-sand-500 mb-5">La plantilla define los controles que se evaluarán en la auditoría.</p>

            {templatesLoading && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 skeleton rounded-xl" />
                ))}
              </div>
            )}

            {templatesError && (
              <ErrorState message={templatesError} onRetry={fetchTemplates} />
            )}

            {!templatesLoading && !templatesError && (
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    selected={selectedTemplateId === t.id}
                    onSelect={() => setSelectedTemplateId(t.id)}
                  />
                ))}
              </div>
            )}
          </Card>

          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => setStep(0)}>
              Atrás
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!selectedTemplateId}
            >
              Crear auditoría
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateCard({
  template, selected, onSelect,
}: {
  template: Template; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'text-left p-4 rounded-xl border-2 transition-all',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-[#e8e4dc] bg-white hover:border-sand-300 hover:bg-sand-50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            selected ? 'bg-blue-600' : 'bg-sand-200'
          )}
        >
          <Layers size={15} className={selected ? 'text-white' : 'text-sand-500'} />
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <Check size={11} className="text-white" />
          </div>
        )}
      </div>
      <p className={clsx('text-sm font-semibold mb-0.5', selected ? 'text-blue-700' : 'text-sand-900')}>
        {template.name}
      </p>
      <p className="text-xs text-sand-500 mb-2">{template.process} · {template.checkCount} controles</p>
      <div className="flex flex-wrap gap-1">
        {template.checksPreview.slice(0, 2).map((c, i) => (
          <Badge key={i} value={c.priority} size="xs" />
        ))}
      </div>
    </button>
  )
}
