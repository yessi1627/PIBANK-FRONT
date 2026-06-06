import api from './api'
import type { AtmCode } from '@/types'

export const atmService = {
  generate: (accountId: number, amount: number) =>
    api.post<AtmCode>('/atm-codes', { accountId, amount }).then((r) => r.data),

  getActive: () =>
    api.get<AtmCode[]>('/atm-codes/active').then((r) => r.data),

  cancel: (id: number) =>
    api.patch(`/atm-codes/${id}/cancel`).then((r) => r.data),
}
