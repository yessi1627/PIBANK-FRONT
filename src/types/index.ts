export type UserRole = 'CUSTOMER' | 'ADMIN' | 'ANALYST' | 'SUPPORT'

export interface User {
  id: number
  email: string
  fullName: string
  role: UserRole
  mfaEnabled: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  mfaRequired?: boolean
  mfaToken?: string
}

export interface MfaVerifyRequest {
  mfaToken: string
  code: string
}

export interface Account {
  id: number
  accountNumber: string
  balance: number
  currency: string
  type: string
  active: boolean
  roundingEnabled: boolean
}

export interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  createdAt: string
  sourceAccount?: string
  targetAccount?: string
  status: string
}

export interface VirtualCard {
  id: number
  cardNumber: string
  cardHolder: string
  expiryDate: string
  blocked: boolean
  accountId: number
  createdAt: string
}

export interface DynamicCvv {
  cvv: string
  expiresAt: string
}

export interface AtmCode {
  id: number
  code: string
  amount: number
  expiresAt: string
  status: string
  accountId: number
  createdAt: string
}

export interface Loan {
  id: number
  amount: number
  term: number
  interestRate: number
  monthlyPayment: number
  status: string
  createdAt: string
  balance: number
}

export interface SavingsPocket {
  id: number
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  accountId: number
  createdAt: string
}

export interface FraudAlert {
  id: number
  type: string
  description: string
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  userId: number
  transactionId?: number
}

export interface ApiError {
  message: string
  status: number
}
