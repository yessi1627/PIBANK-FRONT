import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { savingsService } from '@/services/savings.service'
import { accountService } from '@/services/account.service'
import type { SavingsPocket } from '@/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

const EMOJIS = ['🎯', '✈️', '🏠', '🚗', '📱', '💻', '🎓', '💍', '🏋️', '🌴', '🎮', '👶', '🐶', '🎸', '⚽', '🍕']

function CreatePocketModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [target, setTarget] = useState('')
  const [accountId, setAccountId] = useState('')

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
    select: (data) => data.filter((a) => a.active),
  })

  const mutation = useMutation({
    mutationFn: () =>
      savingsService.create({
        name,
        emoji,
        targetAmount: Number(target),
        accountId: Number(accountId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      toast.success('Bolsillo creado')
      onClose()
    },
    onError: () => toast.error('No se pudo crear el bolsillo'),
  })

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Nuevo bolsillo de ahorro</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        {/* Selector de emoji */}
        <div className="space-y-2">
          <Label>Elige un emoji</Label>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-xl p-1.5 rounded-lg transition-all ${
                  emoji === e ? 'bg-[#00C85330] ring-1 ring-[#00C853]' : 'hover:bg-[#242424]'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 bg-[#242424] rounded-xl">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p className="text-sm font-medium text-white">{name || 'Nombre del bolsillo'}</p>
            <p className="text-xs text-[#606060]">Meta: {target ? formatCurrency(Number(target)) : '$0'}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Ej: Viaje a Cartagena"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="target">Meta de ahorro</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#606060] text-sm">$</span>
            <Input
              id="target"
              placeholder="0"
              inputMode="numeric"
              className="pl-8"
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Cuenta asociada</Label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#242424] px-4 text-sm text-white focus:outline-none focus:border-[#00C853] transition-colors"
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
          disabled={!name || !target || !accountId || mutation.isPending}
        >
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Crear bolsillo'}
        </Button>
      </div>
    </DialogContent>
  )
}

function MovementModal({
  pocket,
  type,
  onClose,
}: {
  pocket: SavingsPocket
  type: 'deposit' | 'withdraw'
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      type === 'deposit'
        ? savingsService.deposit(pocket.id, Number(amount))
        : savingsService.withdraw(pocket.id, Number(amount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success(type === 'deposit' ? 'Depósito exitoso' : 'Retiro exitoso')
      onClose()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error en la operación'
      toast.error(msg)
    },
  })

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>
          {type === 'deposit' ? 'Abonar a' : 'Retirar de'} {pocket.emoji} {pocket.name}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <Label>Monto</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#606060] text-sm">$</span>
            <Input
              placeholder="0"
              inputMode="numeric"
              className="pl-8"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>
        </div>
        <Button
          className="w-full"
          variant={type === 'withdraw' ? 'destructive' : 'default'}
          onClick={() => mutation.mutate()}
          disabled={!amount || Number(amount) <= 0 || mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : type === 'deposit' ? (
            'Abonar'
          ) : (
            'Retirar'
          )}
        </Button>
      </div>
    </DialogContent>
  )
}

export function SavingsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [movement, setMovement] = useState<{ pocket: SavingsPocket; type: 'deposit' | 'withdraw' } | null>(null)

  const { data: pockets = [], isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: savingsService.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: savingsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      toast.success('Bolsillo eliminado')
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  const totalSaved = pockets.reduce((sum, p) => sum + p.currentAmount, 0)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bolsillos</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">Ahorra para tus metas</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        {/* Resumen */}
        {pockets.length > 0 && (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#2A2A2A] rounded-2xl p-5">
            <p className="text-xs text-[#606060]">Total ahorrado</p>
            <p className="text-3xl font-black text-[#00C853] mt-1">{formatCurrency(totalSaved)}</p>
            <p className="text-xs text-[#606060] mt-1">{pockets.length} bolsillo{pockets.length !== 1 ? 's' : ''}</p>
          </div>
        )}

        {/* Lista de bolsillos */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-[#1A1A1A] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : pockets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center text-3xl">
              🐷
            </div>
            <div>
              <p className="text-white font-medium">Sin bolsillos todavía</p>
              <p className="text-[#606060] text-sm mt-1">Crea tu primer bolsillo y empieza a ahorrar</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Crear bolsillo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pockets.map((pocket) => {
              const pct = pocket.targetAmount > 0
                ? Math.min(100, (pocket.currentAmount / pocket.targetAmount) * 100)
                : 0
              const completed = pct >= 100

              return (
                <div key={pocket.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{pocket.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{pocket.name}</p>
                        <p className="text-xs text-[#606060]">
                          Meta: {formatCurrency(pocket.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(pocket.id)}
                      className="text-[#606060] hover:text-[#FF3B30] transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className={completed ? 'text-[#00C853] font-bold' : 'text-white font-bold'}>
                        {formatCurrency(pocket.currentAmount)}
                      </span>
                      <span className="text-[#606060]">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: completed
                            ? '#00C853'
                            : `linear-gradient(to right, #00C853, #00E676)`,
                        }}
                      />
                    </div>
                    {completed && (
                      <p className="text-xs text-[#00C853] font-medium">🎉 ¡Meta alcanzada!</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setMovement({ pocket, type: 'deposit' })}
                    >
                      <ArrowDownCircle size={15} />
                      Abonar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setMovement({ pocket, type: 'withdraw' })}
                      disabled={pocket.currentAmount === 0}
                    >
                      <ArrowUpCircle size={15} />
                      Retirar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <CreatePocketModal onClose={() => setShowCreate(false)} />
      </Dialog>

      <Dialog open={!!movement} onOpenChange={(o) => !o && setMovement(null)}>
        {movement && (
          <MovementModal
            pocket={movement.pocket}
            type={movement.type}
            onClose={() => setMovement(null)}
          />
        )}
      </Dialog>
    </AppLayout>
  )
}
