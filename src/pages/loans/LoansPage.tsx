import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calculator, FileText, CreditCard, Loader2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { loansService } from '@/services/loans.service'
import { accountService } from '@/services/account.service'
import { cn } from '@/lib/utils'
import type { AmortizationRow } from '@/services/loans.service'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

const LOAN_STATUS: Record<string, { label: string; variant: 'default' | 'warning' | 'destructive' | 'secondary' | 'info' }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  APPROVED: { label: 'Aprobado', variant: 'default' },
  REJECTED: { label: 'Rechazado', variant: 'destructive' },
  ACTIVE: { label: 'Activo', variant: 'info' },
  PAID: { label: 'Pagado', variant: 'secondary' },
}

function LoanSimulator() {
  const [amount, setAmount] = useState(5000000)
  const [term, setTerm] = useState(12)
  const [showTable, setShowTable] = useState(false)

  const { data: simulation, isLoading } = useQuery({
    queryKey: ['loan-simulate', amount, term],
    queryFn: () => loansService.simulate({ amount, term }),
    enabled: amount >= 500000,
  })

  return (
    <div className="space-y-5">
      {/* Monto */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-[#A0A0A0]">Monto del crédito</label>
          <span className="text-sm font-bold text-[#00C853]">{formatCurrency(amount)}</span>
        </div>
        <input
          type="range"
          min={500000}
          max={50000000}
          step={500000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00C853 ${((amount - 500000) / (50000000 - 500000)) * 100}%, #2A2A2A ${((amount - 500000) / (50000000 - 500000)) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#606060]">
          <span>$500K</span>
          <span>$50M</span>
        </div>
      </div>

      {/* Plazo */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-[#A0A0A0]">Plazo</label>
          <span className="text-sm font-bold text-[#00C853]">{term} meses</span>
        </div>
        <input
          type="range"
          min={3}
          max={60}
          step={3}
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00C853 ${((term - 3) / (60 - 3)) * 100}%, #2A2A2A ${((term - 3) / (60 - 3)) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#606060]">
          <span>3 meses</span>
          <span>60 meses</span>
        </div>
      </div>

      {/* Resultado */}
      {isLoading ? (
        <div className="h-28 bg-[#242424] rounded-2xl animate-pulse" />
      ) : simulation ? (
        <>
          <div className="bg-gradient-to-br from-[#00C853]/10 to-[#00C853]/5 border border-[#00C853]/20 rounded-2xl p-5">
            <p className="text-xs text-[#A0A0A0] mb-1">Cuota mensual estimada</p>
            <p className="text-4xl font-black text-[#00C853]">
              {formatCurrency(simulation.monthlyPayment)}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#1A1A1A] rounded-xl p-3">
                <p className="text-xs text-[#606060]">Total a pagar</p>
                <p className="text-sm font-bold text-white">{formatCurrency(simulation.totalPayment)}</p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-3">
                <p className="text-xs text-[#606060]">Total intereses</p>
                <p className="text-sm font-bold text-white">{formatCurrency(simulation.totalInterest)}</p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-3 col-span-2">
                <p className="text-xs text-[#606060]">Tasa de interés</p>
                <p className="text-sm font-bold text-white">{simulation.interestRate}% E.A.</p>
              </div>
            </div>
          </div>

          {/* Tabla de amortización */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full flex items-center justify-between p-3 bg-[#242424] rounded-xl text-sm text-[#A0A0A0] hover:text-white transition-colors"
          >
            <span>Tabla de amortización</span>
            {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showTable && (
            <div className="overflow-x-auto rounded-xl border border-[#2A2A2A]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2A2A2A] bg-[#242424]">
                    {['#', 'Cuota', 'Capital', 'Interés', 'Saldo'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[#606060] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {simulation.amortizationTable.map((row: AmortizationRow) => (
                    <tr key={row.period} className="hover:bg-[#242424] transition-colors">
                      <td className="px-3 py-2 text-[#606060]">{row.period}</td>
                      <td className="px-3 py-2 text-white font-medium">{formatCurrency(row.payment)}</td>
                      <td className="px-3 py-2 text-[#00C853]">{formatCurrency(row.principal)}</td>
                      <td className="px-3 py-2 text-[#FF9500]">{formatCurrency(row.interest)}</td>
                      <td className="px-3 py-2 text-[#A0A0A0]">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

function ApplyForm() {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [term, setTerm] = useState('')
  const [accountId, setAccountId] = useState('')
  const [success, setSuccess] = useState(false)

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
    select: (data) => data.filter((a) => a.active),
  })

  const mutation = useMutation({
    mutationFn: () =>
      loansService.apply({
        amount: Number(amount),
        term: Number(term),
        accountId: Number(accountId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loans'] })
      setSuccess(true)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No se pudo enviar la solicitud'
      toast.error(msg)
    },
  })

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#00C85320] flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#00C853]" />
        </div>
        <h3 className="text-lg font-bold text-white">¡Solicitud enviada!</h3>
        <p className="text-sm text-[#A0A0A0]">Tu solicitud está en revisión. Te notificaremos pronto.</p>
        <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>Nueva solicitud</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm text-[#A0A0A0]">Monto solicitado</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#606060] text-sm">$</span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] pl-8 pr-4 text-sm text-white focus:outline-none focus:border-[#00C853] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-[#A0A0A0]">Plazo (meses)</label>
        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="flex h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-white focus:outline-none focus:border-[#00C853] transition-colors"
        >
          <option value="" className="bg-[#1A1A1A]">Selecciona el plazo</option>
          {[3, 6, 12, 18, 24, 36, 48, 60].map((m) => (
            <option key={m} value={m} className="bg-[#1A1A1A]">{m} meses</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-[#A0A0A0]">Cuenta para el desembolso</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="flex h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-white focus:outline-none focus:border-[#00C853] transition-colors"
        >
          <option value="" className="bg-[#1A1A1A]">Selecciona una cuenta</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id} className="bg-[#1A1A1A]">
              •••• {acc.accountNumber.slice(-4)}
            </option>
          ))}
        </select>
      </div>

      <Button
        className="w-full"
        onClick={() => mutation.mutate()}
        disabled={!amount || !term || !accountId || mutation.isPending}
      >
        {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Enviar solicitud'}
      </Button>
    </div>
  )
}

function MyLoans() {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['my-loans'],
    queryFn: loansService.getMyLoans,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 bg-[#242424] rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
        <CreditCard size={32} className="text-[#2A2A2A]" />
        <p className="text-[#606060] text-sm">No tienes créditos activos</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {loans.map((loan) => {
        const status = LOAN_STATUS[loan.status] ?? { label: loan.status, variant: 'secondary' as const }
        const progress = loan.amount > 0 ? ((loan.amount - loan.balance) / loan.amount) * 100 : 0
        return (
          <div key={loan.id} className="bg-[#242424] rounded-2xl p-4 space-y-3 border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">{formatCurrency(loan.amount)}</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-[#606060]">Cuota</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(loan.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-[#606060]">Plazo</p>
                <p className="text-sm font-semibold text-white">{loan.term} meses</p>
              </div>
              <div>
                <p className="text-xs text-[#606060]">Saldo</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(loan.balance)}</p>
              </div>
            </div>
            {loan.status === 'ACTIVE' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#606060]">
                  <span>Progreso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00C853] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

type Tab = 'simulate' | 'apply' | 'my'

export function LoansPage() {
  const [tab, setTab] = useState<Tab>('simulate')

  const TABS = [
    { key: 'simulate' as Tab, label: 'Simulador', icon: <Calculator size={15} /> },
    { key: 'apply' as Tab, label: 'Solicitar', icon: <FileText size={15} /> },
    { key: 'my' as Tab, label: 'Mis créditos', icon: <CreditCard size={15} /> },
  ]

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Créditos</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Simula, solicita y gestiona tus créditos</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all',
                tab === t.key ? 'bg-[#00C853] text-black' : 'text-[#A0A0A0] hover:text-white'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
          {tab === 'simulate' && <LoanSimulator />}
          {tab === 'apply' && <ApplyForm />}
          {tab === 'my' && <MyLoans />}
        </div>
      </div>
    </AppLayout>
  )
}
