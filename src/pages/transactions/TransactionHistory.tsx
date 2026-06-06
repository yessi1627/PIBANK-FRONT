import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const TX_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'TRANSFER_OUT', label: 'Enviados' },
  { value: 'TRANSFER_IN', label: 'Recibidos' },
  { value: 'DEPOSIT', label: 'Depósitos' },
]

export function TransactionHistory() {
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState('')
  const [accountId, setAccountId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
    select: (data) => {
      if (!accountId && data.length > 0) setAccountId(data[0].id)
      return data
    },
  })

  const selectedAccountId = accountId ?? accounts[0]?.id

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'history', selectedAccountId, page, typeFilter, startDate, endDate],
    queryFn: () =>
      transactionService.getHistory(selectedAccountId!, {
        page,
        size: 10,
        type: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: !!selectedAccountId,
  })

  const transactions = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-4">
      {/* Selector de cuenta */}
      {accounts.length > 1 && (
        <select
          value={selectedAccountId}
          onChange={(e) => { setAccountId(Number(e.target.value)); setPage(0) }}
          className="flex h-11 w-full rounded-xl border border-[#2A2A2A] bg-[#242424] px-4 text-sm text-white focus:outline-none focus:border-[#00C853] transition-colors"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id} className="bg-[#1A1A1A]">
              •••• {acc.accountNumber.slice(-4)}
            </option>
          ))}
        </select>
      )}

      {/* Filtros de tipo */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TX_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTypeFilter(t.value); setPage(0) }}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              typeFilter === t.value
                ? 'bg-[#00C853] text-black border-[#00C853]'
                : 'bg-transparent text-[#A0A0A0] border-[#2A2A2A] hover:border-[#3A3A3A]'
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ml-auto',
            showFilters
              ? 'bg-[#00C85320] text-[#00C853] border-[#00C853]'
              : 'bg-transparent text-[#A0A0A0] border-[#2A2A2A] hover:border-[#3A3A3A]'
          )}
        >
          <Filter size={12} />
          Fechas
        </button>
      </div>

      {/* Filtro por fechas */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-[#242424] rounded-xl border border-[#2A2A2A]">
          <div>
            <p className="text-xs text-[#606060] mb-1">Desde</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0) }}
              className="w-full h-9 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-xs text-white focus:outline-none focus:border-[#00C853] transition-colors"
            />
          </div>
          <div>
            <p className="text-xs text-[#606060] mb-1">Hasta</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0) }}
              className="w-full h-9 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-xs text-white focus:outline-none focus:border-[#00C853] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Lista de transacciones */}
      <div className="space-y-0 divide-y divide-[#2A2A2A]">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-xl bg-[#242424] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#242424] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[#242424] rounded animate-pulse w-1/2" />
              </div>
              <div className="h-4 bg-[#242424] rounded animate-pulse w-20" />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <TrendingUp size={32} className="text-[#2A2A2A] mb-3" />
            <p className="text-[#606060] text-sm">Sin movimientos</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN'
            return (
              <div key={tx.id} className="flex items-center gap-4 py-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  isIncome ? 'bg-[#00C85320]' : 'bg-[#FF3B3015]'
                )}>
                  {isIncome
                    ? <TrendingUp size={18} className="text-[#00C853]" />
                    : <TrendingDown size={18} className="text-[#FF3B30]" />
                  }
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
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            <ChevronLeft size={16} />
            Anterior
          </Button>
          <span className="text-xs text-[#606060]">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
          >
            Siguiente
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
