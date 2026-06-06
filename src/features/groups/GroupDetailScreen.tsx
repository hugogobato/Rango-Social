import { useParams } from 'react-router-dom'
import { Users, MessageSquare } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useSessionUser } from '../../lib/query/hooks'

export function GroupDetailScreen() {
  const { groupId } = useParams<{ groupId: string }>()
  const { data: sessionUser } = useSessionUser()

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="text-primary" />
            <span>Tropa {groupId?.replace('g_', '') || 'da Quebrada'}</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">Nossa tropa de rango oficial</p>
        </div>
        <Button size="sm" className="rounded-full text-xs">
          Convidar parça
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-lg font-black text-primary">8</p>
          <p className="text-[10px] text-[#808080]">Membros</p>
        </div>
        <div className="p-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-lg font-black text-primary">34</p>
          <p className="text-[10px] text-[#808080]">Reviews</p>
        </div>
        <div className="p-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-lg font-black text-primary">5</p>
          <p className="text-[10px] text-[#808080]">Duelos</p>
        </div>
      </div>

      {/* Member section */}
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Membros da Tropa</h3>
        <div className="space-y-2">
          {['@carlinhos', '@gaby', '@mari_eats', sessionUser?.username ? `@${sessionUser.username}` : '@criador'].map((handle, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#242424] px-3 py-2.5 rounded-lg border border-[#2D2D2D]">
              <span className="text-xs font-bold text-white">{handle}</span>
              <span className="text-[9px] uppercase font-black tracking-widest text-[#808080]">
                {idx === 0 ? 'Dono' : 'Cria'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat / Poll placeholders */}
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 text-center py-8 space-y-2">
        <MessageSquare className="mx-auto text-[#666]" size={24} />
        <p className="text-xs font-bold text-white">Mural & Enquetes da Tropa</p>
        <p className="text-[10px] text-[#808080] max-w-xs mx-auto">
          Crie votações para decidir o pico do rolê de sexta ou troque ideia com a galera por aqui.
        </p>
        <Button variant="outline" className="text-xs rounded-full border-[#2D2D2D] h-9">
          Nova Enquete
        </Button>
      </Card>
    </div>
  )
}
