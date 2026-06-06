import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { adminService } from '@/services/admin.service'
import type { Loan } from '@/types'

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

function RejectModal({ loan, onClose }: { loan: Loan; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: () => adminService.rejectLoan(loan.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] })
      toast.success('Crédito rechazado')
      onClose()
    },
    onError: () => toast.error('No se pudo rechazar el crédito'),
  })

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Rechazar crédito</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="bg-[#FF3B3010] border border-[#FF3B3030] rounded-xl p-3">
          <p className="text-sm text-white font-medium">{formatCurrency(loan.amount)}</p>
          <p className="text-xs text-[#A0A0A0]">{loan.term} meses</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[#A0A0A0]">Motivo del rechazo</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explica el motivo..."
            rows={3}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#242424] px-4 py-3 text-sm text-white placeholder:text-[#606060] focus:outline-none focus:border-[#FF3B30] transition-colors resize-none"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={!reason.trim() || mutation.isPending}
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Rechazar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [rejectLoan, setRejectLoan] = useState<Loan | null>(null)

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['pending-loans'],
    queryFn: adminService.getPendingLoans,
  })

  const approveMutation = useMutation({
    mutationFn: adminService.approveLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] })
      toast.success('Crédito aprobado')
    },
    onError: () => toast.error('No se pudo aprobar el crédito'),
  })

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Gestión de créditos pendientes</p>
        </div>

        {/* Estadística rápida */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF950020] flex items-center justify-center flex-shrink-0">
            <Clock size={22} className="text-[#FF9500]" />
          </div>
          <div>
            <p className="text-xs text-[#606060]">Créditos pendientes de revisión</p>
            <p className="text-3xl font-black text-white">{loans.length}</p>
          </div>
        </div>

        {/* Lista de créditos */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-[#1A1A1A] rounded-2xl animate-pulse" />
            ))
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
                <CheckCircle2 size={28} className="text-[#00C853]" />
              </div>
              <p className="text-white font-medium">Todo al día</p>
              <p className="text-[#606060] text-sm">No hay créditos pendientes de aprobación</p>
            </div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-black text-white">{formatCurrency(loan.amount)}</p>
                    <p className="text-sm text-[#A0A0A0] mt-0.5">{loan.term} meses · {loan.interestRate}% E.A.</p>
                  </div>
                  <Badge variant="warning">
                    <Clock size={11} className="mr-1" />
                    Pendiente
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#242424] rounded-xl p-2.5">
                    <p className="text-xs text-[#606060]">Cuota mensual</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(loan.monthlyPayment)}</p>
                  </div>
                  <div className="bg-[#242424] rounded-xl p-2.5">
                    <p className="text-xs text-[#606060]">Solicitado</p>
                    <p className="text-sm font-bold text-white">{formatDate(loan.createdAt)}</p>
                  </div>
                  <div className="bg-[#242424] rounded-xl p-2.5">
                    <p className="text-xs text-[#606060]">Tasa</p>
                    <p className="text-sm font-bold text-white">{loan.interestRate}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => approveMutation.mutate(loan.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <><CheckCircle2 size={15} /> Aprobar</>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setRejectLoan(loan)}
                  >
                    <XCircle size={15} />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sección de configuración */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Settings size={18} className="text-[#00C853]" />
            <h2 className="text-sm font-semibold text-white">Accesos rápidos</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Panel de fraude', path: '/fraud', color: '#FF9500' },
              { label: 'Cambiar contraseña', path: '/change-password', color: '#0A84FF' },
            ].map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="flex items-center justify-between p-3 rounded-xl bg-[#242424] hover:bg-[#2A2A2A] transition-colors"
              >
                <span className="text-sm text-white">{item.label}</span>
                <span className="text-xs" style={{ color: item.color }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!rejectLoan} onOpenChange={(o) => !o && setRejectLoan(null)}>
        {rejectLoan && (
          <RejectModal loan={rejectLoan} onClose={() => setRejectLoan(null)} />
        )}
      </Dialog>
    </AppLayout>
  )
}
