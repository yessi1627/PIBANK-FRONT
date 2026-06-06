import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('@/pages/auth/LoginPage')
      return { Component: () => <PublicRoute><LoginPage /></PublicRoute> }
    },
  },
  {
    path: '/register',
    lazy: async () => {
      const { RegisterPage } = await import('@/pages/auth/RegisterPage')
      return { Component: () => <PublicRoute><RegisterPage /></PublicRoute> }
    },
  },
  {
    path: '/mfa',
    lazy: async () => {
      const { MfaPage } = await import('@/pages/auth/MfaPage')
      return { Component: () => <PublicRoute><MfaPage /></PublicRoute> }
    },
  },
  {
    path: '/change-password',
    lazy: async () => {
      const { ChangePasswordPage } = await import('@/pages/auth/ChangePasswordPage')
      return { Component: () => <PrivateRoute><ChangePasswordPage /></PrivateRoute> }
    },
  },
  {
    path: '/dashboard',
    lazy: async () => {
      const { DashboardPage } = await import('@/pages/dashboard/DashboardPage')
      return { Component: () => <PrivateRoute><DashboardPage /></PrivateRoute> }
    },
  },
  {
    path: '/accounts',
    lazy: async () => {
      const { AccountsPage } = await import('@/pages/accounts/AccountsPage')
      return { Component: () => <PrivateRoute><AccountsPage /></PrivateRoute> }
    },
  },
  {
    path: '/transactions',
    lazy: async () => {
      const { TransactionsPage } = await import('@/pages/transactions/TransactionsPage')
      return { Component: () => <PrivateRoute><TransactionsPage /></PrivateRoute> }
    },
  },
  {
    path: '/cards',
    lazy: async () => {
      const { CardsPage } = await import('@/pages/cards/CardsPage')
      return { Component: () => <PrivateRoute><CardsPage /></PrivateRoute> }
    },
  },
  {
    path: '/atm',
    lazy: async () => {
      const { AtmPage } = await import('@/pages/atm/AtmPage')
      return { Component: () => <PrivateRoute><AtmPage /></PrivateRoute> }
    },
  },
  {
    path: '/loans',
    lazy: async () => {
      const { LoansPage } = await import('@/pages/loans/LoansPage')
      return { Component: () => <PrivateRoute><LoansPage /></PrivateRoute> }
    },
  },
  {
    path: '/savings',
    lazy: async () => {
      const { SavingsPage } = await import('@/pages/savings/SavingsPage')
      return { Component: () => <PrivateRoute><SavingsPage /></PrivateRoute> }
    },
  },
  {
    path: '/fraud',
    lazy: async () => {
      const { FraudPage } = await import('@/pages/fraud/FraudPage')
      return { Component: () => <PrivateRoute roles={['ADMIN', 'ANALYST']}><FraudPage /></PrivateRoute> }
    },
  },
  {
    path: '/admin',
    lazy: async () => {
      const { AdminPage } = await import('@/pages/admin/AdminPage')
      return { Component: () => <PrivateRoute roles={['ADMIN']}><AdminPage /></PrivateRoute> }
    },
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
