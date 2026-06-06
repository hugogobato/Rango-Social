import { useParams, Link } from 'react-router-dom'
import { Bookmark, MapPin } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useRestaurants } from '../../lib/query/hooks'

export function ListDetailScreen() {
  const { listId } = useParams<{ listId: string }>()
  const { data: restaurants } = useRestaurants()

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="text-primary animate-pulse" />
            <span>Lista {listId?.replace('l_', '') || 'Favoritos'}</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">Lista de picos salvos do cria</p>
        </div>
        <Button size="sm" className="rounded-full text-xs">
          Adicionar Pico
        </Button>
      </div>

      <div className="space-y-3">
        {restaurants?.slice(0, 3).map((r, index) => (
          <Card key={r.id} className="border-[#2D2D2D] bg-[#1A1A1A] p-4 flex gap-3 hover:border-[#444] transition-all">
            <div className="h-16 w-16 bg-[#242424] rounded-lg overflow-hidden flex-shrink-0">
              <img src={r.photos[0]} alt={r.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/restaurant/${r.id}`} className="text-xs font-bold text-white hover:underline truncate block">
                {r.name}
              </Link>
              <p className="text-[10px] text-[#808080] truncate flex items-center gap-0.5 mt-0.5">
                <MapPin size={9} /> {r.address.neighborhood}
              </p>
              <div className="flex gap-1.5 mt-1.5">
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-black uppercase">
                  Prioridade {index === 0 ? 'Alta 🌟' : 'Média'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
