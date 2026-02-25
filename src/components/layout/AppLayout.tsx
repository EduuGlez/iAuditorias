import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ClipboardList, BarChart3, Settings, Bell, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function AppLayout() {
  const location = useLocation()

  return (

    <div className="flex h-screen overflow-hidden bg-[#faf9f6]">
      {/* SIDEBAR */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-[#e8e4dc] bg-[#f5f3ee]">
        <div className="px-5 py-5 border-b border-[#e8e4dc]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
              <ClipboardList size={15} className="text-white" />
            </div>
            <span className="font-serif text-lg text-sand-900 leading-none">iAuditorías</span>
          </div>
          <p className="text-[11px] text-sand-500 mt-1 ml-9 font-sans">Programa para gestión de auditorías</p>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sand-400 px-2 mb-2">
            MENÚ
          </p>
          <NavItem to="/audits" icon={<ClipboardList size={16} />} label="Auditorías" />
        </nav>
      </aside>

      {/* ZONA DE LA DERECHA: TOPBAR + CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-[#e8e4dc] bg-white/80 backdrop-blur-sm flex-shrink-0">
          {/* Breadcrumb */}
          <Breadcrumb pathname={location.pathname} />

          {/* NOMBRE DE USUARIO Y CAMPANA DE NOTIFICACONES */}
          <div className="flex items-center gap-3 px-2 py-2 mt-2 rounded-lg">
            <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-sand-100 text-sand-500 hover:text-sand-700 transition-colors focus-ring">
              <Bell size={16} />
            </button>
          </div>
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-semibold text-blue-700">EG</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sand-800 truncate">Eduardo Glez</p>
            </div>
          </div>
        </header>
        {/* AQUÍ SE RENDERIZA LA PÁGINA A LA QUE SE ACCEDA */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/**
 * 
 * @param param0 Función que gestiona el meú de navegación lateral
 * @returns 
 */
function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all group',
          isActive
            ? 'bg-white shadow-soft text-sand-900 font-medium'
            : 'text-sand-600 hover:text-sand-900 hover:bg-sand-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={clsx(isActive ? 'text-blue-500' : 'text-sand-400 group-hover:text-sand-600')}>
            {icon}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

/**
 * 
 * @param param0 Función que controla los Breadcrumbs
 * @returns 
 */
function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.split('/').filter(Boolean)

  const labels: Record<string, string> = {
    audits: 'Auditorías',
    new: 'Nueva auditoría',
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1
        const label = labels[part] ?? (part.startsWith('aud_') ? 'Detalle' : part)
        return (
          <span key={part} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="text-sand-300" />}
            <span className={clsx(isLast ? 'text-sand-800 font-medium' : 'text-sand-400')}>
              {label}
            </span>
          </span>
        )
      })}
    </nav>
  )
}