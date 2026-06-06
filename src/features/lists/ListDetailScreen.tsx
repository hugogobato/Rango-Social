import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Bookmark,
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Star,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import {
  useList,
  useRestaurants,
  useAddRestaurantToList,
  useRemoveRestaurantFromList,
  useUpdateList,
} from '../../lib/query/hooks'
import { type CustomList, type ListItem } from '../../domain/models'

export function ListDetailScreen() {
  const { listId } = useParams<{ listId: string }>()
  const { data: list, isLoading: loadingList } = useList(listId || '')
  const { data: allRestaurants } = useRestaurants()

  const addRestaurantMutation = useAddRestaurantToList()
  const removeRestaurantMutation = useRemoveRestaurantFromList()
  const updateListMutation = useUpdateList()

  // Sheet Controls
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('')
  const [priority, setPriority] = useState<number>(2) // Medium default
  const [note, setNote] = useState('')

  if (loadingList) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando lista…</div>
  }

  if (!list) {
    return (
      <div className="text-center py-10 text-xs text-red-400 font-bold">
        Lista não encontrada.
      </div>
    )
  }

  // Find restaurants that aren't already in the list
  const currentRestaurantIds = list.restaurants.map((item) => item.restaurantId)
  const availableRestaurants =
    allRestaurants?.filter(
      (r) =>
        !currentRestaurantIds.includes(r.id) &&
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  // Add a restaurant to the list
  const handleAddRestaurant = () => {
    if (!selectedRestaurantId || !listId) return

    addRestaurantMutation.mutate(
      {
        listId,
        restaurantId: selectedRestaurantId,
        note: note.trim() || null,
        priority,
      },
      {
        onSuccess: () => {
          setIsAddSheetOpen(false)
          setSelectedRestaurantId('')
          setNote('')
          setPriority(2)
          setSearchQuery('')
        },
      }
    )
  }

  // Remove a restaurant from the list
  const handleRemoveRestaurant = (restaurantId: string) => {
    if (!listId) return
    removeRestaurantMutation.mutate({
      listId,
      restaurantId,
    })
  }

  // Swap / Reorder items
  const handleMoveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= list.restaurants.length) return

    const updatedRestaurants = [...list.restaurants]
    // Swap items
    const temp = updatedRestaurants[index]
    updatedRestaurants[index] = updatedRestaurants[newIndex]
    updatedRestaurants[newIndex] = temp

    const updatedList: CustomList = {
      ...list,
      restaurants: updatedRestaurants,
    }

    updateListMutation.mutate(updatedList)
  }

  return (
    <div className="space-y-5 max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="text-primary" />
            <span>{list.name}</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">
            {list.description || 'Uma lista personalizada do cria'}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddSheetOpen(true)}
          className="rounded-full text-xs font-bold flex items-center gap-1 shrink-0"
        >
          <Plus size={14} />
          <span>Adicionar</span>
        </Button>
      </div>

      {/* List Items */}
      <div className="space-y-3">
        {list.restaurants.length > 0 ? (
          list.restaurants.map((item, index) => {
            const r = item.restaurant
            if (!r) return null

            return (
              <Card
                key={r.id}
                className="border-[#2D2D2D] bg-[#1A1A1A] p-3 flex gap-3 hover:border-[#444] transition-all relative group"
              >
                {/* Image */}
                <div className="h-16 w-16 bg-[#242424] rounded-xl overflow-hidden flex-shrink-0 border border-[#2D2D2D]">
                  {r.photos && r.photos[0] ? (
                    <img src={r.photos[0]} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-[#808080]">
                      Sem foto
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <Link
                    to={`/restaurant/${r.id}`}
                    className="text-xs font-bold text-white hover:underline truncate block"
                  >
                    {r.name}
                  </Link>
                  <p className="text-[10px] text-[#808080] truncate flex items-center gap-0.5 mt-0.5">
                    <MapPin size={9} /> {r.address.neighborhood}
                  </p>

                  {/* Priority / Star rating display */}
                  <div className="flex gap-1.5 items-center mt-1.5">
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5">
                      <Star size={8} className="fill-primary" />
                      <span>
                        Prioridade {item.priority === 1 ? 'Mínima' : item.priority === 3 ? 'Máxima' : 'Média'}
                      </span>
                    </span>
                  </div>

                  {/* Note */}
                  {item.note && (
                    <p className="text-[10px] text-[#A0A0A0] bg-[#242424] px-2 py-1 rounded-lg mt-2 italic border-l-2 border-primary">
                      "{item.note}"
                    </p>
                  )}
                </div>

                {/* Reorder and Delete Actions Bar */}
                <div className="flex flex-col justify-between items-center shrink-0 border-l border-[#2D2D2D] pl-2 gap-1.5">
                  <div className="flex flex-col gap-1">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveItem(index, 'UP')}
                      disabled={index === 0}
                      className="p-1 rounded bg-[#242424] text-[#A0A0A0] hover:text-white disabled:opacity-30 disabled:hover:text-[#A0A0A0] transition-all"
                      title="Mover para cima"
                    >
                      <ArrowUp size={12} />
                    </button>
                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveItem(index, 'DOWN')}
                      disabled={index === list.restaurants.length - 1}
                      className="p-1 rounded bg-[#242424] text-[#A0A0A0] hover:text-white disabled:opacity-30 disabled:hover:text-[#A0A0A0] transition-all"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => handleRemoveRestaurant(r.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    title="Remover da lista"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-16 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
            <p className="text-xs text-[#808080] italic">Sua lista está vazia</p>
            <p className="text-[10px] text-[#606060] mt-1">
              Bora colocar uns picos cabulosos aqui pra não esquecer! 🍕
            </p>
          </div>
        )}
      </div>

      {/* Add Restaurant Drawer */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="Adicionar Pico à Lista"
      >
        <div className="space-y-4 pb-8">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar pelo nome do pico…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary"
            />
          </div>

          {/* Restaurant Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Escolher Restaurante
            </label>
            {availableRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {availableRestaurants.map((r) => {
                  const isSelected = selectedRestaurantId === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRestaurantId(r.id)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-white font-black'
                          : 'border-[#2D2D2D] bg-[#242424] text-[#808080] hover:text-white'
                      }`}
                    >
                      <span>{r.name} ({r.address.neighborhood})</span>
                      {isSelected && <Check size={12} className="text-primary" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-[#808080] italic">
                Nenhum restaurante disponível para adicionar.
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Prioridade / Recomendação
            </label>
            <div className="flex bg-[#242424] p-1 rounded-xl border border-[#2D2D2D]">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPriority(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priority === val
                      ? 'bg-primary text-white font-black shadow-sm'
                      : 'text-[#808080] hover:text-white'
                  }`}
                >
                  {val === 1 ? 'Baixa' : val === 3 ? 'Alta' : 'Média'}
                </button>
              ))}
            </div>
          </div>

          {/* Note input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Nota Pessoal (opcional)
            </label>
            <textarea
              placeholder="Ex: Pedir a coxinha de frango sem falta!"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Action CTA */}
          <Button
            onClick={handleAddRestaurant}
            disabled={!selectedRestaurantId || addRestaurantMutation.isPending}
            className="w-full rounded-full font-bold py-3 mt-2"
          >
            Adicionar na lista
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
