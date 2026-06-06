import api from './api'
import type { LoginRequest, LoginResponse, MfaVerifyRequest, AuthTokens, User } from '@/types'

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  verifyMfa: (data: MfaVerifyRequest) =>
    api.post<AuthTokens>('/auth/mfa/verify', data).then((r) => r.data),

  register: (data: {
    fullName: string
    email: string
    password: string
    phone: string
    acceptedTerms: boolean
  }) => api.post('/auth/register', data).then((r) => r.data),

  getProfile: () =>
    api.get<User>('/auth/me').then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
}
