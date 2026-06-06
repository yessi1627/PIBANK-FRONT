import api from './api'
import type { VirtualCard, DynamicCvv } from '@/types'

export const cardsService = {
  getAll: () =>
    api.get<VirtualCard[]>('/cards').then((r) => r.data),

  create: (accountId: number) =>
    api.post<VirtualCard>('/cards', { accountId }).then((r) => r.data),

  getCvv: (id: number) =>
    api.get<DynamicCvv>(`/cards/${id}/cvv`).then((r) => r.data),

  block: (id: number) =>
    api.patch(`/cards/${id}/block`).then((r) => r.data),

  unblock: (id: number) =>
    api.patch(`/cards/${id}/unblock`).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/cards/${id}`).then((r) => r.data),
}
