import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { fraudService } from '@/services/fraud.service'
import { cn } from '@/lib/utils'
import type { FraudAlert } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', variant: 'warning' as const, icon: <Clock size={14} /> },
  RESOLVED: { label: 'Resuelta', variant: 'default' as const, icon: <CheckCircle2 size={14} /> },
  DISMISSED: { label: 'Descartada', variant: 'secondary' as const, icon: <XCircle size={14} /> },
}

const ALERT_TYPE_LABEL: Record<string, string> = {
  UNUSUAL_TRANSACTION: 'Transacción inusual',
  MULTIPLE_FAILED_LOGINS: 'Múltiples intentos fallidos',
  LARGE_TRANSFER: 'Transferencia grande',
  SUSPICIOUS_LOCATION: 'Ubicación sospechosa',
  CARD_FRAUD: 'Fraude de tarjeta',
}

function AlertCard({
  alert,
  onAction,
}: {
  alert: FraudAlert
  onAction: (alert: FraudAlert, type: 'resolve' | 'dismiss') => void
}) {
  const status = STATUS_CONFIG[alert.status]

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
              alert.status === 'PENDING' ? 'bg-[#FF950020]' : 'bg-[#242424]'
            )}
          >
            <ShieldAlert
              size={18}
              className={alert.status === 'PENDING' ? 'text-[#FF9500]' : 'text-[#606060]'}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {ALERT_TYPE_LABEL[alert.type] || alert.type}
            </p>
            <p className="text-xs text-[#606060] mt-0.5">{formatDate(alert.createdAt)}</p>
          </div>
        </div>
        <Badge variant={status.variant}>
          <span className="flex items-center gap-1">
            {status.icon}
            {status.label}
          </span>
        </Badge>
      </div>

      <p className="text-sm text-[#A0A0A0] leading-relaxed">{alert.description}</p>

      {alert.status === 'PENDING' && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction(alert, 'resolve')}
          >
            <ShieldCheck size={14} />
            Resolver
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onAction(alert, 'dismiss')}
          >
            <ShieldX size={14} />
            Descartar
          </Button>
        </div>
      )}
    </div>
  )
}

function ActionModal({
  alert,
  type,
  onClose,
}: {
  alert: FraudAlert
  type: 'resolve' | 'dismiss'
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      type === 'resolve'
        ? fraudService.resolve(alert.id, notes)
        : fraudService.dismiss(alert.id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['fraud-stats'] })
      toast.success(type === 'resolve' ? 'Alerta resuelta' : 'Alerta descartada')
      onClose()
    },
    onError: () => toast.error('No se pudo procesar la acción'),
  })

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>
          {type === 'resolve' ? '✅ Resolver alerta' : '❌ Descartar alerta'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3 mt-2">
        <p className="text-sm text-[#A0A0A0]">
          {ALERT_TYPE_LABEL[alert.type] || alert.type}
        </p>
        <div className="space-y-1.5">
          <label className="text-sm text-[#A0A0A0]">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe la acción tomada..."
            rows={3}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#242424] px-4 py-3 text-sm text-white placeholder:text-[#606060] focus:outline-none focus:border-[#00C853] transition-colors resize-none"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          variant={type === 'dismiss' ? 'destructive' : 'default'}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function FraudPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [action, setAction] = useState<{ alert: FraudAlert; type: 'resolve' | 'dismiss' } | null>(null)

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['fraud-alerts', statusFilter],
    queryFn: () => fraudService.getAlerts(statusFilter || undefined),
  })

  const { data: stats } = useQuery({
    queryKey: ['fraud-stats'],
    queryFn: fraudService.getStats,
  })

  const FILTERS = [
    { value: '', label: 'Todas' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'RESOLVED', label: 'Resueltas' },
    { value: 'DISMISSED', label: 'Descartadas' },
  ]

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de fraude</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Monitoreo y gestión de alertas</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total alertas', value: stats.total, color: '#A0A0A0', bg: '#1A1A1A' },
              { label: 'Pendientes', value: stats.pending, color: '#FF9500', bg: '#FF950015' },
              { label: 'Resueltas', value: stats.resolved, color: '#00C853', bg: '#00C85315' },
              { label: 'Descartadas', value: stats.dismissed, color: '#606060', bg: '#1A1A1A' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#2A2A2A] p-4"
                style={{ background: stat.bg }}
              >
                <p className="text-xs text-[#606060]">{stat.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-[#606060] flex-shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                statusFilter === f.value
                  ? 'bg-[#00C853] text-black border-[#00C853]'
                  : 'bg-transparent text-[#A0A0A0] border-[#2A2A2A] hover:border-[#3A3A3A]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de alertas */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-[#1A1A1A] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <ShieldCheck size={40} className="text-[#2A2A2A]" />
            <p className="text-[#606060]">No hay alertas {statusFilter ? 'con este filtro' : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={(a, t) => setAction({ alert: a, type: t })}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        {action && (
          <ActionModal
            alert={action.alert}
            type={action.type}
            onClose={() => setAction(null)}
          />
        )}
      </Dialog>
    </AppLayout>
  )
}
