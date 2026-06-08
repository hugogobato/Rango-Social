import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, Plus, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { useLists, useCreateList, useSessionUser } from '../../lib/query/hooks'

export function ListsListScreen() {
  const navigate = useNavigate()
  const { data: lists, isLoading } = useLists()
  const { data: currentUser } = useSessionUser()
  const createListMutation = useCreateList()

  // Sheet State
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const myLists = lists?.filter((l) => l.ownerId === currentUser?.id) || []
  const sharedLists = lists?.filter((l) => l.ownerId !== currentUser?.id) || []

  const handleCreateList = () => {
    if (!name.trim() || !currentUser) return

    createListMutation.mutate(
      {
        ownerId: currentUser.id,
        name: name.trim(),
        description: description.trim() || null,
        iconUrl: null,
        coverColor: null,
        isPublic: true,
        isWishlist: false,
        collaborators: [],
        sharedWith: [],
        themes: [],
      },
      {
        onSuccess: (newList) => {
          setIsOpen(false)
          setName('')
          setDescription('')
          navigate(`/list/${newList.id}`)
        },
      }
    )
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="text-primary" />
            <span>Minhas Listas</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">
            Organize seus restaurantes favoritos e wishlists
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-full text-xs font-bold flex items-center gap-1 shrink-0"
        >
          <Plus size={14} />
          <span>Nova Lista</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-xs text-[#808080]">Carregando listas…</div>
      ) : (
        <div className="space-y-6">
          {/* My Lists Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#808080] uppercase tracking-wider">
              Criadas por mim ({myLists.length})
            </h2>
            {myLists.length > 0 ? (
              <div className="space-y-2.5">
                {myLists.map((l) => (
                  <Link key={l.id} to={`/list/${l.id}`} className="block">
                    <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all overflow-hidden">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                          <Bookmark size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{l.name}</h4>
                          <p className="text-[10px] text-[#808080] truncate mt-0.5">
                            {l.restaurants.length} itens • {l.description || 'Sem descrição'}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-[#606060]" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
                <p className="text-xs text-[#808080] italic">Você não criou nenhuma lista ainda</p>
              </div>
            )}
          </div>

          {/* Shared/Followed Lists Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#808080] uppercase tracking-wider">
              Seguindo / Colaborando ({sharedLists.length})
            </h2>
            {sharedLists.length > 0 ? (
              <div className="space-y-2.5">
                {sharedLists.map((l) => (
                  <Link key={l.id} to={`/list/${l.id}`} className="block">
                    <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all overflow-hidden">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-12 w-12 bg-[#242424] border border-[#2D2D2D] rounded-xl flex items-center justify-center text-[#808080] shrink-0">
                          <Bookmark size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{l.name}</h4>
                          <p className="text-[10px] text-[#808080] truncate mt-0.5">
                            {l.restaurants.length} itens • {l.description || 'Sem descrição'}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-[#606060]" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
                <p className="text-xs text-[#808080] italic">Você não segue outras listas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create List Sheet */}
      <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova Lista">
        <div className="space-y-4 pb-8">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Nome da Lista
            </label>
            <input
              type="text"
              placeholder="Ex: Hambúrgueres Must-go"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-primary font-bold"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Descrição
            </label>
            <textarea
              placeholder="Ex: Minha curadoria de melhores smashs e artesanais de SP."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Create CTA */}
          <Button
            onClick={handleCreateList}
            disabled={!name.trim() || createListMutation.isPending}
            className="w-full rounded-full font-bold py-3 mt-2"
          >
            Lançar Lista 🚀
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
