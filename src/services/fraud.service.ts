import api from './api'
import type { FraudAlert } from '@/types'

interface FraudStats {
  total: number
  pending: number
  resolved: number
  dismissed: number
}

export const fraudService = {
  getAlerts: (status?: string) =>
    api.get<FraudAlert[]>('/fraud/alerts', { params: { status } }).then((r) => r.data),

  resolve: (id: number, notes?: string) =>
    api.patch(`/fraud/alerts/${id}/resolve`, { notes }).then((r) => r.data),

  dismiss: (id: number, notes?: string) =>
    api.patch(`/fraud/alerts/${id}/dismiss`, { notes }).then((r) => r.data),

  getStats: () =>
    api.get<FraudStats>('/fraud/stats').then((r) => r.data),
}
