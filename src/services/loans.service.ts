import api from './api'
import type { Loan } from '@/types'

interface SimulateRequest {
  amount: number
  term: number
}

interface SimulateResponse {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  interestRate: number
  amortizationTable: AmortizationRow[]
}

export interface AmortizationRow {
  period: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export const loansService = {
  simulate: (data: SimulateRequest) =>
    api.post<SimulateResponse>('/loans/simulate', data).then((r) => r.data),

  apply: (data: { amount: number; term: number; accountId: number }) =>
    api.post<Loan>('/loans/apply', data).then((r) => r.data),

  getMyLoans: () =>
    api.get<Loan[]>('/loans/my').then((r) => r.data),
}
