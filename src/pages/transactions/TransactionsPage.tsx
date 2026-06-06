import { useState } from 'react'
import { ArrowLeftRight, History } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { TransferForm } from './TransferForm'
import { TransactionHistory } from './TransactionHistory'
import { cn } from '@/lib/utils'

type Tab = 'transfer' | 'history'

export function TransactionsPage() {
  const [tab, setTab] = useState<Tab>('transfer')

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-white">Transferencias</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">Envía dinero y revisa tus movimientos</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
          {([
            { key: 'transfer', label: 'Transferir', icon: <ArrowLeftRight size={16} /> },
            { key: 'history', label: 'Historial', icon: <History size={16} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                tab === t.key
                  ? 'bg-[#00C853] text-black'
                  : 'text-[#A0A0A0] hover:text-white'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
          {tab === 'transfer' ? <TransferForm /> : <TransactionHistory />}
        </div>
      </div>
    </AppLayout>
  )
}
