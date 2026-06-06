import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuthStore } from '@/store/auth.store'
import { accountService } from '@/services/account.service'
import { transactionService } from '@/services/transaction.service'
import { cn } from '@/lib/utils'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  })
}

const QUICK_ACTIONS = [
  { to: '/transactions', icon: <ArrowLeftRight size={22} />, label: 'Transferir', color: '#00C853' },
  { to: '/cards', icon: <CreditCard size={22} />, label: 'Tarjetas', color: '#0A84FF' },
  { to: '/atm', icon: <Landmark size={22} />, label: 'Cajero', color: '#FF9500' },
  { to: '/savings', icon: <PiggyBank size={22} />, label: 'Bolsillos', color: '#BF5AF2' },
]

export function DashboardPage() {
  const { user } = useAuthStore()
  const [hideBalance, setHideBalance] = useState(false)

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  })

  const mainAccount = accounts[0]

  const { data: recentTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', 'recent', mainAccount?.id],
    queryFn: () => transactionService.getRecent(mainAccount!.id, 5),
    enabled: !!mainAccount,
  })

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Saludo */}
        <div>
          <p className="text-[#A0A0A0] text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold text-white">
            {user?.fullName?.split(' ')[0]} 👋
          </h1>
        </div>

        {/* Tarjeta de saldo */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00C853] to-[#00695C] p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-black/70 text-sm font-medium">Saldo total</p>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-black/60 hover:text-black transition-colors"
              >
                {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loadingAccounts ? (
              <div className="h-10 w-48 bg-black/10 rounded-xl animate-pulse" />
            ) : (
              <p className="text-4xl font-black text-black tracking-tight">
                {hideBalance ? '••••••' : formatCurrency(totalBalance)}
              </p>
            )}
            {mainAccount && (
              <p className="text-black/60 text-sm mt-2 font-medium">
                Cuenta {mainAccount.accountNumber}
              </p>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div>
          <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider mb-3">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all active:scale-95"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}20`, color: action.color }}
                >
                  {action.icon}
                </div>
                <span className="text-xs text-[#A0A0A0] font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Últimas transacciones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Últimos movimientos
            </h2>
            <Link
              to="/transactions"
              className="text-xs text-[#00C853] hover:text-[#00E676] transition-colors flex items-center gap-1"
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            {loadingTx ? (
              <div className="divide-y divide-[#2A2A2A]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-[#242424] animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[#242424] rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-[#242424] rounded animate-pulse w-1/2" />
                    </div>
                    <div className="h-4 bg-[#242424] rounded animate-pulse w-20" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ArrowLeftRight size={32} className="text-[#2A2A2A] mb-3" />
                <p className="text-[#606060] text-sm">Sin movimientos aún</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2A2A2A]">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN'
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          isIncome ? 'bg-[#00C85320]' : 'bg-[#FF3B3015]'
                        )}
                      >
                        {isIncome ? (
                          <TrendingUp size={18} className="text-[#00C853]" />
                        ) : (
                          <TrendingDown size={18} className="text-[#FF3B30]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-[#606060]">{formatDate(tx.createdAt)}</p>
                      </div>
                      <p
                        className={cn(
                          'text-sm font-bold flex-shrink-0',
                          isIncome ? 'text-[#00C853]' : 'text-white'
                        )}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cuentas */}
        {accounts.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Mis cuentas
              </h2>
              <Link
                to="/accounts"
                className="text-xs text-[#00C853] hover:text-[#00E676] transition-colors flex items-center gap-1"
              >
                Ver todas <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{acc.type}</p>
                    <p className="text-xs text-[#606060]">•••• {acc.accountNumber.slice(-4)}</p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {hideBalance ? '••••' : formatCurrency(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
