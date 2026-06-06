import api from './api'
import type { SavingsPocket } from '@/types'

export const savingsService = {
  getAll: () =>
    api.get<SavingsPocket[]>('/savings').then((r) => r.data),

  create: (data: { name: string; emoji: string; targetAmount: number; accountId: number }) =>
    api.post<SavingsPocket>('/savings', data).then((r) => r.data),

  deposit: (id: number, amount: number) =>
    api.post(`/savings/${id}/deposit`, { amount }).then((r) => r.data),

  withdraw: (id: number, amount: number) =>
    api.post(`/savings/${id}/withdraw`, { amount }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/savings/${id}`).then((r) => r.data),
}
