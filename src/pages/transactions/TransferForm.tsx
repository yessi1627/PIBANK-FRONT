import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Hash, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { accountService } from '@/services/account.service'
import { transactionService } from '@/services/transaction.service'
import { cn } from '@/lib/utils'

const schema = z.object({
  sourceAccountId: z.string().min(1, 'Selecciona una cuenta origen'),
  identifierType: z.enum(['ACCOUNT_NUMBER', 'PHONE']),
  targetIdentifier: z.string().min(1, 'Ingresa el destinatario'),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: 'Ingresa un monto válido',
  }),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function TransferForm() {
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState(false)

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  })

  const activeAccounts = accounts.filter((a) => a.active)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifierType: 'ACCOUNT_NUMBER' },
  })

  const identifierType = watch('identifierType')
  const sourceAccountId = watch('sourceAccountId')
  const amount = watch('amount')

  const selectedAccount = activeAccounts.find((a) => a.id === Number(sourceAccountId))

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      transactionService.transfer({
        sourceAccountId: Number(data.sourceAccountId),
        targetIdentifier: data.targetIdentifier,
        identifierType: data.identifierType,
        amount: Number(data.amount),
        description: data.description,
      }),
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setTimeout(() => {
        setSuccess(false)
        reset()
      }, 3000)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No se pudo realizar la transferencia'
      toast.error(msg)
    },
  })

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#00C85320] flex items-center justify-center">
          <CheckCircle2 size={36} className="text-[#00C853]" />
        </div>
        <h3 className="text-xl font-bold text-white">¡Transferencia exitosa!</h3>
        <p className="text-[#A0A0A0] text-sm">
          {formatCurrency(Number(amount))} enviados correctamente
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
      {/* Cuenta origen */}
      <div className="space-y-1.5">
        <Label>Cuenta origen</Label>
        <select
          {...register('sourceAccountId')}
          className="flex h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-white focus:outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853] transition-colors"
        >
          <option value="" className="bg-[#1A1A1A]">Selecciona una cuenta</option>
          {activeAccounts.map((acc) => (
            <option key={acc.id} value={acc.id} className="bg-[#1A1A1A]">
              •••• {acc.accountNumber.slice(-4)} — {formatCurrency(acc.balance)}
            </option>
          ))}
        </select>
        {selectedAccount && (
          <p className="text-xs text-[#A0A0A0] pl-1">
            Disponible: <span className="text-[#00C853] font-medium">{formatCurrency(selectedAccount.balance)}</span>
          </p>
        )}
        {errors.sourceAccountId && (
          <p className="text-xs text-[#FF3B30]">{errors.sourceAccountId.message}</p>
        )}
      </div>

      {/* Tipo de destinatario */}
      <div className="space-y-1.5">
        <Label>Enviar a</Label>
        <div className="grid grid-cols-2 gap-2">
          {(['ACCOUNT_NUMBER', 'PHONE'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('identifierType', type)}
              className={cn(
                'flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-medium transition-all',
                identifierType === type
                  ? 'bg-[#00C85320] border-[#00C853] text-[#00C853]'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3A3A3A]'
              )}
            >
              {type === 'ACCOUNT_NUMBER' ? <Hash size={16} /> : <Phone size={16} />}
              {type === 'ACCOUNT_NUMBER' ? 'N° Cuenta' : 'Celular'}
            </button>
          ))}
        </div>
      </div>

      {/* Identificador */}
      <div className="space-y-1.5">
        <Label htmlFor="targetIdentifier">
          {identifierType === 'ACCOUNT_NUMBER' ? 'Número de cuenta' : 'Número de celular'}
        </Label>
        <Input
          id="targetIdentifier"
          placeholder={identifierType === 'ACCOUNT_NUMBER' ? 'Ej: 1234567890' : 'Ej: 3001234567'}
          inputMode="numeric"
          {...register('targetIdentifier')}
        />
        {errors.targetIdentifier && (
          <p className="text-xs text-[#FF3B30]">{errors.targetIdentifier.message}</p>
        )}
      </div>

      {/* Monto */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Monto</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#606060] text-sm font-medium">$</span>
          <Input
            id="amount"
            placeholder="0"
            inputMode="numeric"
            className="pl-8"
            {...register('amount')}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-[#FF3B30]">{errors.amount.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Ej: Pago arriendo"
          {...register('description')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Enviando...
          </>
        ) : (
          'Transferir'
        )}
      </Button>
    </form>
  )
}
