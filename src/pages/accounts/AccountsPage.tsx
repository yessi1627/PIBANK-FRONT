import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Wallet, ChevronRight, TrendingUp, ToggleRight } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { accountService } from '@/services/account.service'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  SAVINGS: 'Cuenta de ahorros',
  CHECKING: 'Cuenta corriente',
  DIGITAL: 'Cuenta digital',
}

export function AccountsPage() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  })

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-white">Mis cuentas</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Administra tus cuentas bancarias</p>
        </div>

        {/* Resumen total */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#2A2A2A] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C85320] flex items-center justify-center">
              <TrendingUp size={20} className="text-[#00C853]" />
            </div>
            <div>
              <p className="text-xs text-[#606060]">Patrimonio total</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <p className="text-xs text-[#606060]">
            {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de cuentas */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#242424]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#242424] rounded w-1/2" />
                    <div className="h-3 bg-[#242424] rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-[#242424] rounded w-24" />
                </div>
              </div>
            ))
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Wallet size={40} className="text-[#2A2A2A] mb-3" />
              <p className="text-[#606060]">No tienes cuentas aún</p>
            </div>
          ) : (
            accounts.map((account) => (
              <Link
                key={account.id}
                to={`/accounts/${account.id}`}
                className="block bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-2xl p-5 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00C85315] flex items-center justify-center flex-shrink-0">
                    <Wallet size={22} className="text-[#00C853]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">
                        {ACCOUNT_TYPE_LABEL[account.type] || account.type}
                      </p>
                      {!account.active && (
                        <Badge variant="destructive">Inactiva</Badge>
                      )}
                      {account.roundingEnabled && (
                        <Badge variant="info">Redondeo activo</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#606060] mt-0.5">
                      •••• •••• {account.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <p className="text-base font-bold text-white">
                      {formatCurrency(account.balance)}
                    </p>
                    <ChevronRight size={16} className="text-[#606060]" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Info redondeo */}
        <div className="bg-[#00C85308] border border-[#00C85320] rounded-2xl p-4 flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <ToggleRight size={18} className="text-[#00C853]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">¿Qué es el redondeo?</p>
            <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">
              Con el redondeo activado, cada compra se redondea al siguiente entero y la diferencia
              se ahorra automáticamente en tu bolsillo de redondeo.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
