import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'

const schema = z
  .object({
    fullName: z.string().min(3, 'Mínimo 3 caracteres'),
    email: z.string().email('Correo electrónico inválido'),
    phone: z
      .string()
      .min(10, 'Mínimo 10 dígitos')
      .regex(/^\d+$/, 'Solo números'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe tener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe tener al menos un símbolo'),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-[#00C853]' : 'text-[#606060]'}`}>
      {met ? <CheckCircle2 size={12} /> : <Circle size={12} />}
      {label}
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const password = watch('password', '')
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        acceptedTerms: data.acceptedTerms as boolean,
      })
      toast.success('¡Cuenta creada! Ya puedes iniciar sesión')
      navigate('/login')
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al crear la cuenta'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00C853] mb-3">
            <span className="text-2xl font-black text-black">π</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Es gratis y sin complicaciones</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" placeholder="Juan Pérez" {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-[#FF3B30]">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
              {errors.email && <p className="text-xs text-[#FF3B30]">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Número de celular</Label>
              <Input id="phone" type="tel" placeholder="3001234567" {...register('phone')} />
              {errors.phone && <p className="text-xs text-[#FF3B30]">{errors.phone.message}</p>}
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
              {password && (
                <div className="grid grid-cols-2 gap-1 pt-1">
                  <PasswordRule met={rules.length} label="8 caracteres" />
                  <PasswordRule met={rules.upper} label="1 mayúscula" />
                  <PasswordRule met={rules.number} label="1 número" />
                  <PasswordRule met={rules.symbol} label="1 símbolo" />
                </div>
              )}
              {errors.password && <p className="text-xs text-[#FF3B30]">{errors.password.message}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-11"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-[#FF3B30]">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Términos */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-3">
                <input
                  id="acceptedTerms"
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded accent-[#00C853] cursor-pointer"
                  {...register('acceptedTerms')}
                />
                <label htmlFor="acceptedTerms" className="text-sm text-[#A0A0A0] cursor-pointer">
                  Acepto los{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[#00C853] hover:text-[#00E676] transition-colors"
                  >
                    términos y condiciones
                  </button>
                </label>
              </div>
              {errors.acceptedTerms && (
                <p className="text-xs text-[#FF3B30]">{errors.acceptedTerms.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#606060] mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#00C853] hover:text-[#00E676] font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>

      {/* Modal Términos */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white">Términos y Condiciones</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-[#606060] hover:text-white transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 text-sm text-[#A0A0A0] leading-relaxed">
              <p><strong className="text-white">1. Aceptación</strong><br />Al registrarte en PIBANK aceptas estos términos en su totalidad.</p>
              <p><strong className="text-white">2. Uso del servicio</strong><br />PIBANK es un banco virtual. Debes ser mayor de 18 años y proporcionar información veraz.</p>
              <p><strong className="text-white">3. Seguridad</strong><br />Eres responsable de mantener la confidencialidad de tu contraseña y los accesos a tu cuenta.</p>
              <p><strong className="text-white">4. Privacidad</strong><br />Tus datos personales son tratados conforme a nuestra política de privacidad y la legislación vigente.</p>
              <p><strong className="text-white">5. Transacciones</strong><br />Las transferencias son irreversibles una vez procesadas. Verifica siempre el destinatario.</p>
              <p><strong className="text-white">6. Modificaciones</strong><br />PIBANK puede actualizar estos términos. Te notificaremos con anticipación ante cambios relevantes.</p>
            </div>
            <div className="p-5 border-t border-[#2A2A2A]">
              <Button className="w-full" onClick={() => setShowTerms(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
