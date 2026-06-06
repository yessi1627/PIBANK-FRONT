import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Landmark, Plus, Clock, X, Loader2, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { atmService } from '@/services/atm.service'
import { accountService } from '@/services/account.service'
import type { AtmCode } from '@/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setTimeLeft({
        minutes: Math.floor(diff / 60),
        seconds: diff % 60,
        total: diff,
      })
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const totalSeconds = 300 // 5 min
  const pct = (timeLeft.total / totalSeconds) * 100
  const color = timeLeft.total > 120 ? '#00C853' : timeLeft.total > 60 ? '#FF9500' : '#FF3B30'
  const expired = timeLeft.total === 0

  if (expired) {
    return <span className="text-xs text-[#FF3B30] font-medium">Expirado</span>
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-medium" style={{ color }}>
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

function AtmCodeCard({ code, onCancel }: { code: AtmCode; onCancel: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code.code)
    setCopied(true)
    toast.success('Código copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default">Activo</Badge>
          <span className="text-sm text-[#A0A0A0]">{formatCurrency(code.amount)}</span>
        </div>
        <button
          onClick={onCancel}
          className="text-[#606060] hover:text-[#FF3B30] transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>

      <div
        onClick={copyCode}
        className="flex items-center justify-between bg-[#242424] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#2A2A2A] transition-colors"
      >
        <span className="text-2xl font-black font-mono tracking-[0.3em] text-white">
          {code.code}
        </span>
        {copied
          ? <CheckCircle2 size={18} className="text-[#00C853]" />
          : <Copy size={18} className="text-[#606060]" />
        }
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#606060]">
          <Clock size={12} />
          Expira en
        </div>
        <CountdownTimer expiresAt={code.expiresAt} />
      </div>
    </div>
  )
}

function GenerateForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [generated, setGenerated] = useState<AtmCode | null>(null)

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
    select: (data) => data.filter((a) => a.active),
  })

  const mutation = useMutation({
    mutationFn: () => atmService.generate(Number(accountId), Number(amount)),
    onSuccess: (data) => {
      setGenerated(data)
      queryClient.invalidateQueries({ queryKey: ['atm-codes'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No se pudo generar el código'
      toast.error(msg)
    },
  })

  if (generated) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center py-4 text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#00C85320] flex items-center justify-center">
            <CheckCircle2 size={28} className="text-[#00C853]" />
          </div>
          <p className="text-lg font-bold text-white">¡Código generado!</p>
          <p className="text-xs text-[#A0A0A0]">Úsalo en cualquier cajero PIBANK</p>
        </div>
        <div
          onClick={() => { navigator.clipboard.writeText(generated.code); toast.success('Código copiado') }}
          className="flex items-center justify-between bg-[#242424] border border-[#2A2A2A] rounded-2xl px-6 py-4 cursor-pointer hover:border-[#3A3A3A] transition-colors"
        >
          <span className="text-3xl font-black font-mono tracking-[0.3em] text-[#00C853]">
            {generated.code}
          </span>
          <Copy size={18} className="text-[#606060]" />
        </div>
        <CountdownTimer expiresAt={generated.expiresAt} />
        <Button variant="outline" className="w-full" onClick={() => { setGenerated(null); setAmount(''); onSuccess() }}>
          Generar otro código
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Cuenta origen</Label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="flex h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-white focus:outline-none focus:border-[#00C853] transition-colors"
        >
          <option value="" className="bg-[#1A1A1A]">Selecciona una cuenta</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id} className="bg-[#1A1A1A]">
              •••• {acc.accountNumber.slice(-4)} — {formatCurrency(acc.balance)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Monto a retirar</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#606060] text-sm">$</span>
          <Input
            id="amount"
            placeholder="0"
            inputMode="numeric"
            className="pl-8"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <div className="bg-[#00C85308] border border-[#00C85320] rounded-xl p-3 text-xs text-[#A0A0A0] leading-relaxed">
        El código expira en <strong className="text-white">5 minutos</strong>. Solo puede usarse una vez en cajeros PIBANK habilitados.
      </div>

      <Button
        className="w-full"
        onClick={() => mutation.mutate()}
        disabled={!accountId || !amount || Number(amount) <= 0 || mutation.isPending}
      >
        {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Generar código'}
      </Button>
    </div>
  )
}

export function AtmPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'generate' | 'active'>('generate')

  const { data: activeCodes = [], isLoading } = useQuery({
    queryKey: ['atm-codes'],
    queryFn: atmService.getActive,
    refetchInterval: 30000,
  })

  const cancelMutation = useMutation({
    mutationFn: atmService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atm-codes'] })
      toast.success('Código cancelado')
    },
    onError: () => toast.error('No se pudo cancelar'),
  })

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Código ATM</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Retira efectivo sin tarjeta</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
          {([
            { key: 'generate', label: 'Generar código', icon: <Plus size={15} /> },
            { key: 'active', label: `Activos${activeCodes.length > 0 ? ` (${activeCodes.length})` : ''}`, icon: <Clock size={15} /> },
          ] as { key: 'generate' | 'active'; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-[#00C853] text-black' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
          {tab === 'generate' ? (
            <GenerateForm onSuccess={() => setTab('active')} />
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-28 bg-[#242424] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <Landmark size={32} className="text-[#2A2A2A]" />
              <p className="text-[#606060] text-sm">No tienes códigos activos</p>
              <Button size="sm" variant="outline" onClick={() => setTab('generate')}>
                Generar un código
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCodes.map((code) => (
                <AtmCodeCard
                  key={code.id}
                  code={code}
                  onCancel={() => cancelMutation.mutate(code.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
