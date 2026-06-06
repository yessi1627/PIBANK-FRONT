import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Plus, Eye, EyeOff, Lock, Unlock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cardsService } from '@/services/cards.service'
import { accountService } from '@/services/account.service'
import type { VirtualCard } from '@/types'

function maskCardNumber(number: string) {
  const clean = number.replace(/\s/g, '')
  return `•••• •••• •••• ${clean.slice(-4)}`
}

function CvvTimer({ expiresAt }: { expiresAt: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const pct = (secondsLeft / 30) * 100
  const color = secondsLeft > 10 ? '#00C853' : secondsLeft > 5 ? '#FF9500' : '#FF3B30'

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{secondsLeft}s</span>
    </div>
  )
}

function CvvModal({ card, onClose }: { card: VirtualCard; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [showCvv, setShowCvv] = useState(false)

  const { data: cvvData, isLoading, refetch } = useQuery({
    queryKey: ['cvv', card.id],
    queryFn: () => cardsService.getCvv(card.id),
    enabled: showCvv,
    refetchInterval: (query) => {
      if (!query.state.data) return false
      const msLeft = new Date(query.state.data.expiresAt).getTime() - Date.now()
      return msLeft <= 1000 ? 100 : false
    },
  })

  useEffect(() => {
    if (!cvvData) return
    const msLeft = new Date(cvvData.expiresAt).getTime() - Date.now()
    if (msLeft <= 0) refetch()
  }, [cvvData, refetch])

  const blockMutation = useMutation({
    mutationFn: () => card.blocked ? cardsService.unblock(card.id) : cardsService.block(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success(card.blocked ? 'Tarjeta desbloqueada' : 'Tarjeta bloqueada')
      onClose()
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Tarjeta •••• {card.cardNumber.slice(-4)}</DialogTitle>
      </DialogHeader>

      {/* Tarjeta visual */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] p-5 my-2">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex justify-between items-start mb-8">
          <div className="w-8 h-6 rounded bg-[#FFD700]/80" />
          <span className="text-xs font-bold text-[#606060] uppercase">Virtual</span>
        </div>
        <p className="font-mono text-white text-lg tracking-widest mb-4">
          {maskCardNumber(card.cardNumber)}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-[#606060] uppercase">Titular</p>
            <p className="text-sm font-medium text-white">{card.cardHolder}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#606060] uppercase">Vence</p>
            <p className="text-sm font-medium text-white">{card.expiryDate}</p>
          </div>
        </div>
        {card.blocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 bg-[#FF3B30] px-4 py-2 rounded-full">
              <Lock size={14} className="text-white" />
              <span className="text-white text-sm font-bold">Bloqueada</span>
            </div>
          </div>
        )}
      </div>

      {/* CVV dinámico */}
      {!card.blocked && (
        <div className="bg-[#242424] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#A0A0A0]">CVV dinámico</p>
            <button
              onClick={() => setShowCvv(!showCvv)}
              className="text-[#606060] hover:text-white transition-colors"
            >
              {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showCvv ? (
            isLoading ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 size={16} className="animate-spin text-[#00C853]" />
                <span className="text-sm text-[#606060]">Generando...</span>
              </div>
            ) : cvvData ? (
              <>
                <p className="text-3xl font-black text-[#00C853] font-mono tracking-widest mt-1">
                  {cvvData.cvv}
                </p>
                <CvvTimer expiresAt={cvvData.expiresAt} />
              </>
            ) : null
          ) : (
            <p className="text-2xl font-black text-[#2A2A2A] font-mono tracking-widest mt-1">•••</p>
          )}
        </div>
      )}

      {/* Acciones */}
      <Button
        variant={card.blocked ? 'default' : 'destructive'}
        className="w-full"
        onClick={() => blockMutation.mutate()}
        disabled={blockMutation.isPending}
      >
        {blockMutation.isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : card.blocked ? (
          <><Unlock size={16} /> Desbloquear tarjeta</>
        ) : (
          <><Lock size={16} /> Bloquear tarjeta</>
        )}
      </Button>
    </DialogContent>
  )
}

function CreateCardModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [selectedAccount, setSelectedAccount] = useState('')

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
    select: (data) => data.filter((a) => a.active),
  })

  const mutation = useMutation({
    mutationFn: () => cardsService.create(Number(selectedAccount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Tarjeta virtual creada')
      onClose()
    },
    onError: () => toast.error('No se pudo crear la tarjeta'),
  })

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Nueva tarjeta virtual</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <p className="text-sm text-[#A0A0A0]">Cuenta asociada</p>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
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
        <div className="bg-[#00C85308] border border-[#00C85320] rounded-xl p-3 text-xs text-[#A0A0A0] leading-relaxed">
          La tarjeta virtual es gratuita y tiene un CVV que cambia cada 30 segundos para mayor seguridad.
        </div>
        <Button
          className="w-full"
          onClick={() => mutation.mutate()}
          disabled={!selectedAccount || mutation.isPending}
        >
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Crear tarjeta'}
        </Button>
      </div>
    </DialogContent>
  )
}

export function CardsPage() {
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: cardsService.getAll,
  })

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tarjetas virtuales</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">Gestiona tus tarjetas digitales</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Nueva
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-28 bg-[#1A1A1A] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
              <CreditCard size={28} className="text-[#2A2A2A]" />
            </div>
            <p className="text-[#606060]">No tienes tarjetas virtuales</p>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Crear mi primera tarjeta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#2A2A2A] hover:border-[#3A3A3A] p-5 transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-8 h-6 rounded bg-[#FFD700]/80" />
                  <div className="flex items-center gap-2">
                    {card.blocked && <Badge variant="destructive">Bloqueada</Badge>}
                    <span className="text-xs text-[#606060]">Virtual</span>
                  </div>
                </div>
                <p className="font-mono text-white tracking-widest text-sm mb-3">
                  {maskCardNumber(card.cardNumber)}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-[#606060]">TITULAR</p>
                    <p className="text-sm font-medium text-white">{card.cardHolder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#606060]">VENCE</p>
                    <p className="text-sm font-medium text-white">{card.expiryDate}</p>
                  </div>
                </div>
                {card.blocked && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <Lock size={20} className="text-[#FF3B30]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedCard} onOpenChange={(o) => !o && setSelectedCard(null)}>
        {selectedCard && <CvvModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <CreateCardModal onClose={() => setShowCreate(false)} />
      </Dialog>
    </AppLayout>
  )
}
