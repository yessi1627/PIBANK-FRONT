import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await authService.login(data)

      if (response.mfaRequired && response.mfaToken) {
        sessionStorage.setItem('mfaToken', response.mfaToken)
        navigate('/mfa')
        return
      }

      if (response.accessToken && response.refreshToken) {
        const profile = await authService.getProfile()
        setAuth(profile, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        })
        navigate('/dashboard')
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Credenciales incorrectas'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00C853] mb-4">
            <span className="text-2xl font-black text-black">π</span>
          </div>
          <h1 className="text-3xl font-bold text-white">PIBANK</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Tu banco, siempre contigo</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Bienvenido de vuelta</h2>
          <p className="text-[#606060] text-sm mb-6">Ingresa a tu cuenta</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-[#FF3B30]">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#00C853] hover:text-[#00E676] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#FF3B30]">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#606060] mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#00C853] hover:text-[#00E676] font-medium transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
