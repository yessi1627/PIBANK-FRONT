import api from './api'
import type { Transaction } from '@/types'

interface TransferRequest {
  targetIdentifier: string
  identifierType: 'ACCOUNT_NUMBER' | 'PHONE'
  amount: number
  description?: string
  sourceAccountId: number
}

interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
}

interface TransactionFilters {
  page?: number
  size?: number
  type?: string
  startDate?: string
  endDate?: string
}

export const transactionService = {
  transfer: (data: TransferRequest) =>
    api.post<Transaction>('/transactions/transfer', data).then((r) => r.data),

  getHistory: (accountId: number, filters: TransactionFilters = {}) =>
    api
      .get<PaginatedResponse<Transaction>>(`/transactions/account/${accountId}`, {
        params: { page: 0, size: 10, ...filters },
      })
      .then((r) => r.data),

  getRecent: (accountId: number, limit = 5) =>
    api
      .get<Transaction[]>(`/transactions/account/${accountId}/recent`, {
        params: { limit },
      })
      .then((r) => r.data),
}
