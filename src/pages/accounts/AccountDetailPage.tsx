import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Wallet,
  Copy,
  RotateCcw,
  Power,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    year: 'numeric',
  })
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  SAVINGS: 'Cuenta de ahorros',
  CHECKING: 'Cuenta corriente',
  DIGITAL: 'Cuenta digital',
}

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accountId = Number(id)

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => accountService.getById(accountId),
    enabled: !isNaN(accountId),
  })

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', 'recent', accountId],
    queryFn: () => transactionService.getRecent(accountId, 10),
    enabled: !isNaN(accountId),
  })

  const roundingMutation = useMutation({
    mutationFn: (enabled: boolean) => accountService.toggleRounding(accountId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', accountId] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success(
        account?.roundingEnabled ? 'Redondeo desactivado' : 'Redondeo activado'
      )
    },
    onError: () => toast.error('No se pudo cambiar el redondeo'),
  })

  const statusMutation = useMutation({
    mutationFn: (active: boolean) => accountService.toggleActive(accountId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', accountId] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success(account?.active ? 'Cuenta desactivada' : 'Cuenta activada')
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  const copyAccountNumber = () => {
    if (account) {
      navigator.clipboard.writeText(account.accountNumber)
      toast.success('Número copiado')
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="h-8 bg-[#1A1A1A] rounded-xl animate-pulse w-32" />
          <div className="h-40 bg-[#1A1A1A] rounded-2xl animate-pulse" />
          <div className="h-24 bg-[#1A1A1A] rounded-2xl animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  if (!account) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <Wallet size={40} className="text-[#2A2A2A] mb-3" />
          <p className="text-[#606060]">Cuenta no encontrada</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/accounts')}>
            Volver a cuentas
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Volver */}
        <button
          onClick={() => navigate('/accounts')}
          className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Mis cuentas
        </button>

        {/* Tarjeta principal */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#2A2A2A] p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[#A0A0A0] text-sm">
                {ACCOUNT_TYPE_LABEL[account.type] || account.type}
              </p>
              <p className="text-3xl font-black text-white mt-1">
                {formatCurrency(account.balance)}
              </p>
            </div>
            <div className="flex gap-2">
              {!account.active && <Badge variant="destructive">Inactiva</Badge>}
              {account.roundingEnabled && <Badge variant="info">Redondeo</Badge>}
            </div>
          </div>

          {/* Número de cuenta */}
          <div
            onClick={copyAccountNumber}
            className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#161616] transition-colors"
          >
            <div>
              <p className="text-xs text-[#606060]">Número de cuenta</p>
              <p className="text-sm font-mono font-medium text-white tracking-wider">
                {account.accountNumber}
              </p>
            </div>
            <Copy size={16} className="text-[#606060]" />
          </div>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-3">
          {/* Toggle redondeo */}
          <button
            onClick={() => roundingMutation.mutate(!account.roundingEnabled)}
            disabled={roundingMutation.isPending}
            className={cn(
              'flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all',
              account.roundingEnabled
                ? 'bg-[#00C85315] border-[#00C85340] hover:bg-[#00C85320]'
                : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                account.roundingEnabled ? 'bg-[#00C85330]' : 'bg-[#242424]'
              )}
            >
              <RotateCcw
                size={18}
                className={account.roundingEnabled ? 'text-[#00C853]' : 'text-[#606060]'}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Redondeo</p>
              <p className={cn('text-xs', account.roundingEnabled ? 'text-[#00C853]' : 'text-[#606060]')}>
                {account.roundingEnabled ? 'Activado' : 'Desactivado'}
              </p>
            </div>
          </button>

          {/* Toggle estado */}
          <button
            onClick={() => statusMutation.mutate(!account.active)}
            disabled={statusMutation.isPending}
            className={cn(
              'flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all',
              account.active
                ? 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
                : 'bg-[#FF3B3010] border-[#FF3B3030] hover:bg-[#FF3B3020]'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                account.active ? 'bg-[#242424]' : 'bg-[#FF3B3020]'
              )}
            >
              <Power size={18} className={account.active ? 'text-[#606060]' : 'text-[#FF3B30]'} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Cuenta</p>
              <p className={cn('text-xs', account.active ? 'text-[#606060]' : 'text-[#FF3B30]')}>
                {account.active ? 'Desactivar' : 'Activar'}
              </p>
            </div>
          </button>
        </div>

        {/* Transferir desde esta cuenta */}
        <button
          onClick={() => navigate('/transactions')}
          className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-2xl transition-all"
        >
          <span className="text-sm font-medium text-white">Transferir desde esta cuenta</span>
          <ChevronRight size={18} className="text-[#606060]" />
        </button>

        {/* Movimientos recientes */}
        <div>
          <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider mb-3">
            Movimientos recientes
          </h2>
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
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[#606060] text-sm">Sin movimientos</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2A2A2A]">
                {transactions.map((tx) => {
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
                      <p className={cn('text-sm font-bold flex-shrink-0', isIncome ? 'text-[#00C853]' : 'text-white')}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
