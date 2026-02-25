# iAuditorías — Prueba Técnica Frontend

Módulo de gestión de auditorías construido con **React 18 + TypeScript**, **React Router v6**, **Tailwind CSS** y una API simulada con comportamiento realista.

---

## Arranque rápido

```bash
# Instalar dependencias
npm install

# Arrancar en desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Decisiones técnicas

### Stack elegido
- **React 18 + TypeScript** — tipado estricto en modelos, props y respuestas de API, lo que reduce errores en runtime y hace el código más mantenible.
- **React Router v6** — enrutado declarativo con soporte de `useSearchParams`, clave para persistir filtros en la URL.
- **Tailwind CSS** — utilidades atómicas que permiten iterar rápido en la UI sin salir del JSX. Paleta personalizada (sand, coral, sage) definida en `tailwind.config.js`.
- **Vite** — build tool moderno, arranque instantáneo y HMR muy rápido.

### Arquitectura
```
src/
├── pages/         
├── components/
│   ├── layout/     
│   └── ui/           
├── services/
│   └── api.ts       
├── types/
│   └── index.ts     
└── data/
    └── mockData.ts 
```

La capa `services/api.ts` actúa como si fuera un backend real: expone funciones async (`getAudits`, `createAudit`, `runAudit`…) igual que se haría con una API REST.

### Filtros en la URL
Todos los filtros se encuentran en los query params de la URL (`?q=ISO&status=DRAFT&page=2`). Esto permite compartir una búsqueda, usar el botón atrás del navegador y mantener el estado al recargar.

### Simulación de ejecución
Al pulsar "Ejecutar auditoría", la función `simulateExecution` itera sobre los checks aplicando delays variables y transiciones de estado (`QUEUED → RUNNING → OK/KO`). El detalle de la auditoría hace polling cada 800ms usando `getAuditFromStore`, que lee el store directamente sin pasar por `maybeThrow`, evitando fallos aleatorios durante la ejecución en curso.

---

## Funcionalidades implementadas

- **Listado de auditorías** con búsqueda, filtros múltiples, ordenación y paginación server-side simulada
- **Wizard de creación** en 2 pasos con validación antes de avanzar y carga lazy de plantillas
- **Detalle de auditoría** con resumen, barra de progreso en tiempo real y listado de checks
- **Ejecución automática** de checks con transiciones de estado y actualización de progreso
- **Evaluación manual** OK/KO por check mientras la auditoría está en curso
- **Estados de UI**: skeleton loaders, error state con reintento, empty state con CTA
- **UI optimista** al actualizar un check, con rollback si la llamada falla
- **Toast notifications** para feedback de acciones
- **Filtros persistidos en URL** con limpieza individual y total

---

## API simulada

Configuración en `services/api.ts`:

| Parámetro | Valor | Descripción |
|---|---|---|
| `MIN_LATENCY` | 300ms | Latencia mínima por request |
| `MAX_LATENCY` | 1200ms | Latencia máxima por request |
| `ERROR_RATE` | 12% | Probabilidad de error aleatorio |
| `KO_PROBABILITY` | 15% | Probabilidad de que un check falle en ejecución automática |

### Endpoints simulados

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/audits` | Listado paginado con filtros y ordenación |
| GET | `/audits/:id` | Detalle + checks |
| POST | `/audits` | Crear auditoría desde el wizard |
| POST | `/audits/:id/run` | Iniciar ejecución progresiva |
| PATCH | `/audits/:id/checks/:checkId` | Actualizar un check |
| GET | `/templates` | Listar plantillas disponibles |

---

## Dataset

- **60 auditorías** distribuidas entre 8 procesos
- **8 procesos**: Compras, Ventas, Seguridad, RRHH, Operaciones, Finanzas, IT, Legal
- **10 responsables**
- **8 plantillas** con 12–28 checks cada una
- Coherencia de datos: DRAFT → 0%, DONE → 100%, IN_PROGRESS → 1–99%

---

## Mejoras pendientes

- **Guardar evidencia en servidor**: el textarea de evidencia actualiza estado local pero no llama a `updateCheck` con el texto escrito.
- **Breadcrumb dinámico**: mostrar el nombre real de la auditoría en lugar de "Detalle".
- **Endpoint de usuarios**: cargar los responsables dinámicamente en lugar de tenerlos hardcodeados.
- **Tests**: 2–3 tests unitarios de `api.ts`.
- **Modo offline**: cachear el último listado en `localStorage` y mostrar un aviso si la API falla.
- **WebSockets**: reemplazar el polling de 800ms por eventos push para la actualización del progreso.
