import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Plus, Check, ChevronRight, Award } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { useGroups, useCreateGroup, useSessionUser } from '../../lib/query/hooks'
import { MetricId } from '../../domain/models'

const METRIC_LABELS: Record<MetricId, string> = {
  [MetricId.PRICE]: 'Preço',
  [MetricId.SERVICE]: 'Atendimento',
  [MetricId.LOCATION]: 'Localização',
  [MetricId.VIBE]: 'Vibe',
  [MetricId.AESTHETIC]: 'Visual/Aesthetic',
  [MetricId.PORTION]: 'Fartura',
  [MetricId.TASTE]: 'Sabor',
  [MetricId.COST_BENEFIT]: 'Custo-benefício',
  [MetricId.VEGAN_OPTIONS]: 'Opções Veganas',
  [MetricId.GLUTEN_FREE]: 'Sem Glúten',
  [MetricId.WAIT_TIME]: 'Tempo de Espera',
  [MetricId.CLEANLINESS]: 'Limpeza',
}

export function GroupsListScreen() {
  const navigate = useNavigate()
  const { data: groups, isLoading } = useGroups()
  const { data: currentUser } = useSessionUser()
  const createGroupMutation = useCreateGroup()

  // Sheet State
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mandatoryMetrics, setMandatoryMetrics] = useState<MetricId[]>([])

  const myGroups = groups?.filter((g) =>
    g.members.some((m) => m.userId === currentUser?.id)
  ) || []

  const otherGroups = groups?.filter(
    (g) => !g.members.some((m) => m.userId === currentUser?.id)
  ) || []

  const handleToggleMetric = (m: MetricId) => {
    if (mandatoryMetrics.includes(m)) {
      setMandatoryMetrics(mandatoryMetrics.filter((item) => item !== m))
    } else {
      setMandatoryMetrics([...mandatoryMetrics, m])
    }
  }

  const handleCreateGroup = () => {
    if (!name.trim() || !currentUser) return

    createGroupMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        coverUrl: `https://picsum.photos/seed/${name}/400/200`,
        adminId: currentUser.id,
        admins: [currentUser.id],
        isOpen: true,
        mandatoryMetrics,
      },
      {
        onSuccess: (newGroup) => {
          setIsOpen(false)
          setName('')
          setDescription('')
          setMandatoryMetrics([])
          navigate(`/group/${newGroup.id}`)
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
            <Users className="text-primary" />
            <span>Minhas Tropas</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">
            Compare notas e marque rolês com seus squads favoritos
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-full text-xs font-bold flex items-center gap-1 shrink-0"
        >
          <Plus size={14} />
          <span>Criar Tropa</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-xs text-[#808080]">Carregando tropas…</div>
      ) : (
        <div className="space-y-6">
          {/* My Groups Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#808080] uppercase tracking-wider">
              Tropas que Participo ({myGroups.length})
            </h2>
            {myGroups.length > 0 ? (
              <div className="space-y-2.5">
                {myGroups.map((g) => (
                  <Link key={g.id} to={`/group/${g.id}`} className="block">
                    <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all overflow-hidden">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                          <Users size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
                          <p className="text-[10px] text-[#808080] truncate mt-0.5">
                            {g.memberCount} membros • {g.description || 'Sem descrição'}
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
                <p className="text-xs text-[#808080] italic">Você não participa de nenhuma tropa ainda</p>
              </div>
            )}
          </div>

          {/* Explore Other Groups Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#808080] uppercase tracking-wider">
              Descobrir Novas Tropas ({otherGroups.length})
            </h2>
            {otherGroups.length > 0 ? (
              <div className="space-y-2.5">
                {otherGroups.map((g) => (
                  <Link key={g.id} to={`/group/${g.id}`} className="block">
                    <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all overflow-hidden">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-12 w-12 bg-[#242424] border border-[#2D2D2D] rounded-xl flex items-center justify-center text-[#808080] shrink-0">
                          <Users size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
                          <p className="text-[10px] text-[#808080] truncate mt-0.5">
                            {g.memberCount} membros • {g.description || 'Sem descrição'}
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
                <p className="text-xs text-[#808080] italic">Sem outras tropas no momento</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Group Sheet */}
      <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Criar Nova Tropa">
        <div className="space-y-4 pb-8">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Nome da Tropa
            </label>
            <input
              type="text"
              placeholder="Ex: Podrões do Centro"
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
              placeholder="Ex: Tropa focada em comer os melhores hambúrgueres raiz e petiscos."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Mandatory Metrics */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider flex items-center gap-1">
              <Award size={12} className="text-primary" />
              <span>Métricas Obrigatórias (para reviews da tropa)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {Object.values(MetricId).map((m) => {
                const isActive = mandatoryMetrics.includes(m)
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleToggleMetric(m)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1 ${
                      isActive
                        ? 'border-primary bg-primary/10 text-white font-black'
                        : 'border-[#2D2D2D] bg-[#242424] text-[#808080] hover:text-white'
                    }`}
                  >
                    {isActive && <Check size={11} className="text-primary" />}
                    <span>{METRIC_LABELS[m]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Create CTA */}
          <Button
            onClick={handleCreateGroup}
            disabled={!name.trim() || createGroupMutation.isPending}
            className="w-full rounded-full font-bold py-3 mt-2"
          >
            Lançar Tropa 🚀
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
