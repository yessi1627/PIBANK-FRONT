import api from './api'
import type { Account } from '@/types'

export const accountService = {
  getAll: () =>
    api.get<Account[]>('/accounts').then((r) => r.data),

  getById: (id: number) =>
    api.get<Account>(`/accounts/${id}`).then((r) => r.data),

  toggleRounding: (id: number, enabled: boolean) =>
    api.patch(`/accounts/${id}/rounding`, { enabled }).then((r) => r.data),

  toggleActive: (id: number, active: boolean) =>
    api.patch(`/accounts/${id}/status`, { active }).then((r) => r.data),
}
