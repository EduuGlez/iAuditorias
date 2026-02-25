import type { Owner, Template, Audit, Check } from '../types'

/**
 * Listado de 10 usuarios
 */
export const OWNERS: Owner[] = [
  { id: 'u_1', name: 'Ana López' },
  { id: 'u_2', name: 'Carlos García' },
  { id: 'u_3', name: 'María Fernández' },
  { id: 'u_4', name: 'Javier Martínez' },
  { id: 'u_5', name: 'Laura Sánchez' },
  { id: 'u_6', name: 'Roberto Torres' },
  { id: 'u_7', name: 'Isabel Ruiz' },
  { id: 'u_8', name: 'Miguel Moreno' },
  { id: 'u_9', name: 'Sofía Jiménez' },
  { id: 'u_10', name: 'Diego Herrera' },
]

/**
 * Listado de 8 procesos
 */
export const PROCESSES = ['Compras', 'Ventas', 'Seguridad', 'RRHH', 'Operaciones', 'Finanzas', 'IT', 'Legal']

/**
 * Listado de 8 plantillas
 */
export const TEMPLATES: Template[] = [
  {
    id: 'tpl_1', name: 'ISO 27001 Base', process: 'Seguridad', checkCount: 24,
    checksPreview: [
      { title: 'Gestión de accesos', priority: 'HIGH' },
      { title: 'Backup y recuperación', priority: 'MEDIUM' },
      { title: 'Cifrado de datos', priority: 'HIGH' },
    ],
  },
  {
    id: 'tpl_2', name: 'SOX Compras', process: 'Compras', checkCount: 18,
    checksPreview: [
      { title: 'Aprobación de pedidos', priority: 'HIGH' },
      { title: 'Control de proveedores', priority: 'MEDIUM' },
      { title: 'Auditoría de facturas', priority: 'HIGH' },
    ],
  },
  {
    id: 'tpl_3', name: 'ISO 9001 Calidad', process: 'Operaciones', checkCount: 21,
    checksPreview: [
      { title: 'Control de procesos', priority: 'MEDIUM' },
      { title: 'Indicadores de calidad', priority: 'HIGH' },
      { title: 'Revisión documental', priority: 'LOW' },
    ],
  },
  {
    id: 'tpl_4', name: 'GDPR Compliance', process: 'Legal', checkCount: 15,
    checksPreview: [
      { title: 'Registro de tratamientos', priority: 'HIGH' },
      { title: 'Derechos de usuarios', priority: 'HIGH' },
      { title: 'Transferencias internacionales', priority: 'MEDIUM' },
    ],
  },
  {
    id: 'tpl_5', name: 'RRHH Evaluación', process: 'RRHH', checkCount: 12,
    checksPreview: [
      { title: 'Evaluación de desempeño', priority: 'MEDIUM' },
      { title: 'Plan de formación', priority: 'LOW' },
      { title: 'Control de absentismo', priority: 'MEDIUM' },
    ],
  },
  {
    id: 'tpl_6', name: 'Ventas B2B', process: 'Ventas', checkCount: 16,
    checksPreview: [
      { title: 'Validación de contratos', priority: 'HIGH' },
      { title: 'Gestión de pipeline', priority: 'MEDIUM' },
      { title: 'Comisiones y bonos', priority: 'HIGH' },
    ],
  },
  {
    id: 'tpl_7', name: 'Finanzas Cierre', process: 'Finanzas', checkCount: 20,
    checksPreview: [
      { title: 'Conciliación bancaria', priority: 'HIGH' },
      { title: 'Provisiones contables', priority: 'HIGH' },
      { title: 'Revisión de gastos', priority: 'MEDIUM' },
    ],
  },
  {
    id: 'tpl_8', name: 'IT Infraestructura', process: 'IT', checkCount: 28,
    checksPreview: [
      { title: 'Parches de seguridad', priority: 'HIGH' },
      { title: 'Monitorización sistemas', priority: 'MEDIUM' },
      { title: 'Plan de contingencia', priority: 'HIGH' },
    ],
  },
]

/**
 * Función axiliar que elige un elemento aleatorio de un array
 * @param arr 
 * @returns 
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Función auxiliar que genera una fecha aleatoria entre dos fechas
 * @param start 
 * @param end 
 * @returns 
 */
function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

/**
 * Función auxiliar que genera una fecha aleatoria entre 10 y 100 días en el futuro
 * @returns 
 */
function randomFutureDate(): string {
  const future = new Date()
  future.setDate(future.getDate() + Math.floor(Math.random() * 90) + 10)
  return future.toISOString().split('T')[0]
}

/**
 * 
 * @param templateId Función que genera un array de controles asociados a una auditoria dado una plantilla y el identificador de una auditoria
 * @param auditId 
 * @returns 
 */
function generateChecks(templateId: string, auditId: string): Check[] {
  const template = TEMPLATES.find((t) => t.id === templateId)!
  const count = template?.checkCount ?? 15

  const checkTitles: Record<string, string[]> = {
    tpl_1: [
      'Verificar control de acceso a sistemas', 'Revisar política de contraseñas', 'Comprobar cifrado en reposo',
      'Auditar logs de acceso', 'Verificar segmentación de red', 'Revisar gestión de parches',
      'Comprobar plan de contingencia', 'Auditar accesos privilegiados', 'Verificar backups',
      'Revisar gestión de incidentes', 'Comprobar clasificación de datos', 'Auditar permisos de usuarios',
      'Verificar autenticación multifactor', 'Revisar políticas de datos', 'Comprobar monitorización',
      'Auditar controles de red', 'Verificar gestión de vulnerabilidades', 'Revisar capacitación en seguridad',
      'Comprobar inventario de activos', 'Auditar relaciones con proveedores', 'Verificar continuidad del negocio',
      'Revisar gestión de cambios', 'Comprobar tests de penetración', 'Auditar políticas de retención',
    ],
    tpl_2: [
      'Verificar aprobaciones de compra', 'Revisar evaluación de proveedores', 'Comprobar trazabilidad pedidos',
      'Auditar facturas recibidas', 'Verificar contratos vigentes', 'Revisar condiciones de pago',
      'Comprobar recepción de bienes', 'Auditar límites de autorización', 'Verificar conciliaciones',
      'Revisar selección de proveedores', 'Comprobar políticas de compra', 'Auditar gastos de viaje',
      'Verificar pedidos urgentes', 'Revisar devoluciones y créditos', 'Comprobar segregación de funciones',
      'Auditar compras sin pedido', 'Verificar actualización de precios', 'Revisar controles de acceso ERP',
    ],
    default: Array.from({ length: count }, (_, i) => `Control ${i + 1} — Verificación de cumplimiento`),
  }

  const titles = checkTitles[templateId] ?? checkTitles.default
  const priorities: Check['priority'][] = ['LOW', 'MEDIUM', 'HIGH']

  return Array.from({ length: Math.min(count, titles.length) }, (_, i) => ({
    id: `chk_${auditId}_${i + 1}`,
    title: titles[i] ?? `Control ${i + 1}`,
    priority: priorities[Math.floor(Math.random() * 3)],
    status: 'PENDING',
    evidence: '',
    reviewed: false,
    updatedAt: new Date().toISOString(),
  }))
}

/**
 * Genera el nombre de la auditoria combinando un nombre predefinido por proceso con el propio proceso
 * @param process 
 * @param index 
 * @returns 
 */
function generateAuditName(process: string, index: number): string {
  const names: Record<string, string[]> = {
    Compras: ['Auditoría SOX Compras', 'Revisión Proveedores', 'Control de Pagos', 'Evaluación Contratos', 'Auditoría Gastos'],
    Ventas: ['Auditoría Pipeline B2B', 'Revisión Facturación', 'Control Comisiones', 'Evaluación CRM', 'Auditoría Contratos'],
    Seguridad: ['Auditoría ISO 27001', 'Revisión GDPR', 'Control Accesos IT', 'Evaluación Riesgos', 'Auditoría Incidentes'],
    RRHH: ['Evaluación Desempeño Q1', 'Auditoría Nóminas', 'Revisión Contratos', 'Control Absentismo', 'Evaluación Formación'],
    Operaciones: ['Auditoría ISO 9001', 'Control Calidad', 'Revisión SLAs', 'Evaluación Procesos', 'Auditoría Logística'],
    Finanzas: ['Cierre Contable Q1', 'Auditoría Fiscal', 'Control Presupuesto', 'Revisión Inversiones', 'Evaluación Tesorería'],
    IT: ['Auditoría Infraestructura', 'Revisión Licencias', 'Control Cambios IT', 'Evaluación Seguridad', 'Auditoría DR/BCP'],
    Legal: ['Revisión GDPR Anual', 'Auditoría Compliance', 'Control Contratos', 'Evaluación Riesgos Legales', 'Revisión Políticas'],
  }
  const arr = names[process] ?? [`Auditoría ${process}`]
  return `${arr[index % arr.length]} — ${process}`
}

/**
 * Generamos de forma aleatoria 60 auditorias
 */
export const AUDITS: Audit[] = Array.from({ length: 60 }, (_, i) => {
  const id = `aud_${1001 + i}`
  const process = PROCESSES[i % PROCESSES.length]
  const status: Audit['status'][] = ['DRAFT', 'IN_PROGRESS', 'DONE', 'BLOCKED']
  const s = status[Math.floor(Math.random() * 4)]
  const progress =
    s === 'DRAFT' ? 0 :
    s === 'DONE' ? 100 :
    Math.floor(Math.random() * 98) + 1
  const template = TEMPLATES[i % TEMPLATES.length]
  const owner = OWNERS[i % OWNERS.length]

  return {
    id,
    name: generateAuditName(process, i),
    process,
    status: s,
    progress,
    owner,
    targetDate: randomFutureDate(),
    updatedAt: randomDate(new Date('2026-01-01'), new Date('2026-02-20')),
    createdAt: randomDate(new Date('2025-10-01'), new Date('2026-01-31')),
    templateId: template.id,
  }
})

/**
 * Generamos para cada auditoria los procedimientos asociados
 * Estos dos exports finales (AUDITS y CHECKS_MAP) son los que consume api.ts
 */
export const CHECKS_MAP: Record<string, Check[]> = {}
AUDITS.forEach((audit) => {
  CHECKS_MAP[audit.id] = generateChecks(audit.templateId, audit.id)
})
