import { useNavigate } from 'react-router-dom'
import { Settings, LogOut, Moon, Volume2, Shield } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { copy } from '../../copy/pt-BR'

export function SettingsScreen() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('hasCompletedOnboarding')
    toast('Até a próxima, cria! 👋', 'info')
    navigate('/onboarding')
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="text-primary" />
          <span>{copy.settings.title}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">Configure o app do seu jeito</p>
      </div>

      <div className="space-y-4">
        {/* Slang Level Option Card */}
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 size={14} className="text-primary" /> Nível de Gírias
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {['Baixo', 'Médio', 'Mano (Máximo)'].map((level, idx) => (
              <button
                key={idx}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  idx === 2
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-[#2D2D2D] bg-[#242424] text-[#A0A0A0]'
                }`}
                onClick={() => toast(`Nível de gíria alterado para ${level}!`, 'success')}
              >
                {level}
              </button>
            ))}
          </div>
        </Card>

        {/* Display Settings Card */}
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-secondary" />
            <div>
              <p className="text-xs font-bold text-white">Modo Escuro Padrão</p>
              <p className="text-[10px] text-[#808080]">Sem agredir as vistas de noite</p>
            </div>
          </div>
          <div className="h-5 w-9 rounded-full bg-primary p-0.5 cursor-pointer flex justify-end">
            <div className="h-4 w-4 rounded-full bg-white" />
          </div>
        </Card>

        {/* Security / Terms */}
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-white">Segurança & Bots</p>
              <p className="text-[10px] text-[#808080]">CPF Validado na entrada</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded font-extrabold uppercase">
            Ativo
          </span>
        </Card>

        {/* Logout button */}
        <Button
          onClick={handleLogout}
          className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white font-bold h-11 flex items-center justify-center gap-1.5"
        >
          <LogOut size={16} />
          <span>{copy.settings.logout}</span>
        </Button>
      </div>
    </div>
  )
}
