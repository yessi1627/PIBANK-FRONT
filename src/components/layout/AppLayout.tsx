import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Landmark,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Inicio' },
  { to: '/accounts', icon: <Wallet size={20} />, label: 'Cuentas' },
  { to: '/transactions', icon: <ArrowLeftRight size={20} />, label: 'Transferencias' },
  { to: '/cards', icon: <CreditCard size={20} />, label: 'Tarjetas' },
  { to: '/atm', icon: <Landmark size={20} />, label: 'Cajero' },
  { to: '/loans', icon: <ChevronRight size={20} />, label: 'Créditos' },
  { to: '/savings', icon: <PiggyBank size={20} />, label: 'Bolsillos' },
  { to: '/fraud', icon: <ShieldAlert size={20} />, label: 'Fraude', roles: ['ADMIN', 'ANALYST'] },
  { to: '/admin', icon: <Settings size={20} />, label: 'Admin', roles: ['ADMIN'] },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  )

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignored */ }
    logout()
    navigate('/login')
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = location.pathname === item.to
    return (
      <Link
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          active
            ? 'bg-[#00C85320] text-[#00C853]'
            : 'text-[#A0A0A0] hover:bg-[#242424] hover:text-white'
        )}
      >
        {item.icon}
        {item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-[#2A2A2A] bg-[#0D0D0D] fixed h-full z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[#2A2A2A]">
          <div className="w-9 h-9 rounded-xl bg-[#00C853] flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-black text-black">π</span>
          </div>
          <span className="text-lg font-bold text-white">PIBANK</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => <NavLink key={item.to} item={item} />)}
        </nav>

        {/* Usuario */}
        <div className="px-3 py-4 border-t border-[#2A2A2A] space-y-1">
          <Link
            to="/change-password"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A0A0A0] hover:bg-[#242424] hover:text-white transition-all"
          >
            <Settings size={20} />
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A0A0A0] hover:bg-[#FF3B3015] hover:text-[#FF3B30] transition-all"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
          <div className="px-3 pt-2">
            <p className="text-xs font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-[#606060] truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer móvil */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] z-40 flex flex-col transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00C853] flex items-center justify-center">
              <span className="text-base font-black text-black">π</span>
            </div>
            <span className="font-bold text-white">PIBANK</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-[#606060] hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => <NavLink key={item.to} item={item} />)}
        </nav>
        <div className="px-3 py-4 border-t border-[#2A2A2A] space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A0A0A0] hover:bg-[#FF3B3015] hover:text-[#FF3B30] transition-all"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
          <div className="px-3 pt-1">
            <p className="text-xs font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-[#606060] truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Header móvil */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-[#2A2A2A] bg-[#0D0D0D] sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00C853] flex items-center justify-center">
              <span className="text-sm font-black text-black">π</span>
            </div>
            <span className="font-bold text-white text-sm">PIBANK</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center">
            <span className="text-xs font-bold text-[#00C853]">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
