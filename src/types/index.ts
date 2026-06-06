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

export interface ApiError {
  message: string
  status: number
}
