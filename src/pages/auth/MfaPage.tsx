import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

export function MfaPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const mfaToken = sessionStorage.getItem('mfaToken')
    if (!mfaToken) navigate('/login')
    else inputs.current[0]?.focus()
  }, [navigate])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) inputs.current[index + 1]?.focus()
    if (newCode.every((d) => d !== '')) handleVerify(newCode.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      inputs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (finalCode: string) => {
    const mfaToken = sessionStorage.getItem('mfaToken')
    if (!mfaToken) return
    setIsLoading(true)
    try {
      const tokens = await authService.verifyMfa({ mfaToken, code: finalCode })
      sessionStorage.removeItem('mfaToken')
      const profile = await authService.getProfile()
      setAuth(profile, tokens)
      navigate('/dashboard')
    } catch {
      toast.error('Código incorrecto. Intenta de nuevo.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const full = code.join('')
    if (full.length === 6) handleVerify(full)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Icono */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00C85320] border border-[#00C85340] mb-4">
            <ShieldCheck size={32} className="text-[#00C853]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verificación en dos pasos</h1>
          <p className="text-[#A0A0A0] text-sm mt-2 leading-relaxed">
            Ingresa el código de 6 dígitos de tu<br />aplicación Google Authenticator
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Inputs del código */}
            <div className="flex justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none
                    ${digit
                      ? 'border-[#00C853] bg-[#00C85310] text-[#00C853]'
                      : 'border-[#2A2A2A] bg-[#242424] text-white'
                    }
                    focus:border-[#00C853] focus:bg-[#00C85310] focus:ring-1 focus:ring-[#00C853]
                    disabled:opacity-50`}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.some((d) => d === '')}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar código'
              )}
            </Button>
          </form>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="block text-center text-sm text-[#606060] hover:text-white transition-colors mt-6 w-full"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  )
}
