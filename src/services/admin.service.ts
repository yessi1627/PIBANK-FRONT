import api from './api'
import type { Loan } from '@/types'

export const adminService = {
  getPendingLoans: () =>
    api.get<Loan[]>('/admin/loans/pending').then((r) => r.data),

  approveLoan: (id: number) =>
    api.patch(`/admin/loans/${id}/approve`).then((r) => r.data),

  rejectLoan: (id: number, reason: string) =>
    api.patch(`/admin/loans/${id}/reject`, { reason }).then((r) => r.data),
}
