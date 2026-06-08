import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Plus, Check, Vote } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { ReviewCard } from '../../components/shared/ReviewCard'
import {
  useGroup,
  useReviews,
  useSessionUser,
  useJoinGroup,
  useLeaveGroup,
  useRestaurants,
} from '../../lib/query/hooks'
import { calculateRestaurantRanking } from '../../domain/logic/ranking'
import { type Poll } from '../../domain/models'

export function GroupDetailScreen() {
  const { groupId } = useParams<{ groupId: string }>()
  const { data: group, isLoading: loadingGroup } = useGroup(groupId || '')
  const { data: reviews, isLoading: loadingReviews } = useReviews()
  const { data: restaurants } = useRestaurants()
  const { data: currentUser } = useSessionUser()

  const joinGroupMutation = useJoinGroup()
  const leaveGroupMutation = useLeaveGroup()

  // Tab State: 'FEED' | 'RANKING' | 'MEMBERS' | 'POLLS'
  const [activeTab, setActiveTab] = useState<'FEED' | 'RANKING' | 'MEMBERS' | 'POLLS'>('FEED')

  // Interactive Polls State
  const [polls, setPolls] = useState<Poll[]>([])

  // Poll Sheet Controls
  const [isPollSheetOpen, setIsPollSheetOpen] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptionsText, setPollOptionsText] = useState<string[]>(['', ''])

  // Initialize mock polls once group is loaded
  useEffect(() => {
    if (group) {
      setPolls([
        {
          id: `poll_${group.id}_1`,
          groupId: group.id,
          createdBy: group.adminId,
          question: 'Qual o pico do rolê de sexta à noite? 🍔',
          options: [
            {
              id: 'opt_1',
              restaurantId: null,
              text: 'Amasse o Burger (Pinheiros)',
              votes: ['u_dudacomida', 'u_guilherme'],
              voteCount: 2,
            },
            {
              id: 'opt_2',
              restaurantId: null,
              text: 'Beco do Chope (Consolação)',
              votes: ['u_carla'],
              voteCount: 1,
            },
            {
              id: 'opt_3',
              restaurantId: null,
              text: 'Sushi Vibe (Liberdade)',
              votes: [],
              voteCount: 0,
            },
          ],
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          isMultipleChoice: false,
          createdAt: new Date().toISOString(),
        },
      ])
    }
  }, [group])

  if (loadingGroup) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando tropa…</div>
  }

  if (!group) {
    return (
      <div className="text-center py-10 text-xs text-red-400 font-bold">
        Tropa não encontrada.
      </div>
    )
  }

  const isUserMember = group.members.some((m) => m.userId === currentUser?.id)

  // 1. Group reviews
  const groupReviews =
    reviews?.filter((r) =>
      r.targetDestinations.some((dest) => dest.type === 'group' && dest.id === group.id)
    ) || []

  // 2. Group internal ranking calculation
  const ranked = restaurants
    ? calculateRestaurantRanking(restaurants, groupReviews, null, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    : []

  // Handle Joining
  const handleJoin = () => {
    if (!currentUser) return
    joinGroupMutation.mutate(
      { groupId: group.id, userId: currentUser.id },
      {
        onSuccess: () => {
          // Trigger local cache sync
          window.location.reload()
        },
      }
    )
  }

  // Handle Leaving
  const handleLeave = () => {
    if (!currentUser) return
    leaveGroupMutation.mutate(
      { groupId: group.id, userId: currentUser.id },
      {
        onSuccess: () => {
          // Trigger local cache sync
          window.location.reload()
        },
      }
    )
  }

  // Handle Poll voting
  const handleVote = (pollId: string, optionId: string) => {
    if (!currentUser) return
    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id !== pollId) return poll

        // Remove vote if already voted for this option, otherwise add vote
        const updatedOptions = poll.options.map((opt) => {
          const hasVoted = opt.votes.includes(currentUser.id)
          let newVotes = [...opt.votes]

          if (hasVoted) {
            newVotes = newVotes.filter((id) => id !== currentUser.id)
          } else {
            newVotes.push(currentUser.id)
          }

          // If not multiple choice, remove current user vote from all other options
          if (!hasVoted && !poll.isMultipleChoice) {
            return opt.id === optionId
              ? { ...opt, votes: newVotes, voteCount: newVotes.length }
              : {
                  ...opt,
                  votes: opt.votes.filter((id) => id !== currentUser.id),
                  voteCount: Math.max(0, opt.voteCount - (opt.votes.includes(currentUser.id) ? 1 : 0)),
                }
          }

          return { ...opt, votes: newVotes, voteCount: newVotes.length }
        })

        return { ...poll, options: updatedOptions }
      })
    )
  }

  // Create new poll option fields
  const handleAddOptionField = () => {
    if (pollOptionsText.length >= 6) return
    setPollOptionsText([...pollOptionsText, ''])
  }

  const handleCreatePoll = () => {
    if (!pollQuestion.trim() || !currentUser) return
    const validOptions = pollOptionsText.filter((opt) => opt.trim() !== '')
    if (validOptions.length < 2) return

    const newPoll: Poll = {
      id: `poll_${group.id}_${Date.now()}`,
      groupId: group.id,
      createdBy: currentUser.id,
      question: pollQuestion.trim(),
      options: validOptions.map((text, idx) => ({
        id: `opt_${idx}`,
        restaurantId: null,
        text: text.trim(),
        votes: [],
        voteCount: 0,
      })),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isMultipleChoice: false,
      createdAt: new Date().toISOString(),
    }

    setPolls([newPoll, ...polls])
    setIsPollSheetOpen(false)
    setPollQuestion('')
    setPollOptionsText(['', ''])
  }

  return (
    <div className="space-y-5 max-w-md mx-auto pb-10">
      {/* Cover Image Header */}
      <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-[#2D2D2D]">
        {group.coverUrl ? (
          <img src={group.coverUrl} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center">
            <Users size={36} className="text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-1.5">
              <span>👥 {group.name}</span>
            </h1>
            <p className="text-[10px] text-[#A0A0A0] mt-0.5">{group.description}</p>
          </div>
          {isUserMember ? (
            <Button
              size="xs"
              variant="outline"
              onClick={handleLeave}
              className="text-[9px] border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold rounded-full py-1 h-auto"
            >
              Sair da Tropa
            </Button>
          ) : (
            <Button
              size="xs"
              onClick={handleJoin}
              className="text-[9px] font-bold rounded-full py-1 h-auto"
            >
              Participar
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-base font-black text-primary">{group.memberCount}</p>
          <p className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider">Crias</p>
        </div>
        <div className="p-2 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-base font-black text-primary">{groupReviews.length}</p>
          <p className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider">Reviews</p>
        </div>
        <div className="p-2 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-base font-black text-primary">{polls.length}</p>
          <p className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider">Enquetes</p>
        </div>
        <div className="p-2 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl">
          <p className="text-base font-black text-primary">
            {group.mandatoryMetrics.length}
          </p>
          <p className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider">Métricas</p>
        </div>
      </div>

      {/* Mandatory Metrics Badges */}
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-3 rounded-xl space-y-1.5">
        <h4 className="text-[9px] font-bold text-[#808080] uppercase tracking-wider">
          Métricas Obrigatórias da Tropa
        </h4>
        <div className="flex flex-wrap gap-1">
          {group.mandatoryMetrics.map((m) => (
            <span
              key={m}
              className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            >
              🎯 {m.toLowerCase().replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Detail Tabs Bar */}
      <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-[#2D2D2D]">
        <button
          onClick={() => setActiveTab('FEED')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
            activeTab === 'FEED'
              ? 'bg-[#242424] text-white border border-[#2D2D2D]'
              : 'text-[#808080] hover:text-white'
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('RANKING')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
            activeTab === 'RANKING'
              ? 'bg-[#242424] text-white border border-[#2D2D2D]'
              : 'text-[#808080] hover:text-white'
          }`}
        >
          Ranking
        </button>
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
            activeTab === 'MEMBERS'
              ? 'bg-[#242424] text-white border border-[#2D2D2D]'
              : 'text-[#808080] hover:text-white'
          }`}
        >
          Crias
        </button>
        <button
          onClick={() => setActiveTab('POLLS')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
            activeTab === 'POLLS'
              ? 'bg-[#242424] text-white border border-[#2D2D2D]'
              : 'text-[#808080] hover:text-white'
          }`}
        >
          Enquetes
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-4">
        {/* -------------------- FEED TAB -------------------- */}
        {activeTab === 'FEED' && (
          <div className="space-y-4">
            {loadingReviews ? (
              <div className="text-center py-10 text-xs text-[#808080]">Carregando fofocas…</div>
            ) : groupReviews.length > 0 ? (
              groupReviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="text-center py-12 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
                <p className="text-xs text-[#808080] italic">Nenhum post na tropa ainda</p>
                {isUserMember && (
                  <Link to="/review" className="block mt-2">
                    <Button size="xs" className="rounded-full text-[10px]">
                      Ser o primeiro a mandar a real 🚀
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* -------------------- RANKING TAB -------------------- */}
        {activeTab === 'RANKING' && (
          <div className="space-y-3">
            {ranked.length > 0 ? (
              ranked.slice(0, 10).map((item, idx) => {
                const r = item.restaurant
                return (
                  <Link key={r.id} to={`/restaurant/${r.id}`}>
                    <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center w-8">
                          {idx === 0 ? (
                            <span className="text-2xl">🥇</span>
                          ) : idx === 1 ? (
                            <span className="text-2xl">🥈</span>
                          ) : idx === 2 ? (
                            <span className="text-2xl">🥉</span>
                          ) : (
                            <span className="text-sm font-black text-[#808080] bg-[#242424] w-7 h-7 flex items-center justify-center rounded-full">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{r.name}</h4>
                          <p className="text-[10px] text-[#808080]">
                            {r.address.neighborhood} • {r.categories[0]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-primary">🌶️ {item.score.toFixed(1)}</span>
                        <p className="text-[8px] text-[#808080] uppercase tracking-wider font-bold">
                          Nota Tropa
                        </p>
                      </div>
                    </Card>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-12 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
                <p className="text-xs text-[#808080] italic">Sem notas suficientes para ranking</p>
              </div>
            )}
          </div>
        )}

        {/* -------------------- MEMBERS TAB -------------------- */}
        {activeTab === 'MEMBERS' && (
          <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3 shadow-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Crias Participantes</h3>
            <div className="space-y-2">
              {group.members.map((member, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-[#242424] px-3 py-2.5 rounded-lg border border-[#2D2D2D]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] flex items-center justify-center text-[10px] text-white font-bold">
                      👤
                    </div>
                    <span className="text-xs font-bold text-white">
                      {member.userId === currentUser?.id ? 'Você' : `@user_${member.userId.slice(2, 6)}`}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#808080]">
                    {group.adminId === member.userId ? 'Líder 👑' : 'Cria 🤝'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* -------------------- POLLS TAB -------------------- */}
        {activeTab === 'POLLS' && (
          <div className="space-y-4">
            {/* Create Poll CTA */}
            {isUserMember && (
              <Button
                onClick={() => setIsPollSheetOpen(true)}
                className="w-full rounded-xl bg-gradient-to-tr from-[#242424] to-[#2D2D2D] hover:from-primary hover:to-[#FF8C61] border border-[#2D2D2D] text-white text-xs font-bold py-3 flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                <Plus size={14} />
                <span>Nova Enquete da Tropa</span>
              </Button>
            )}

            {/* Polls list */}
            {polls.length > 0 ? (
              polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0)
                const hasVotedAny = poll.options.some((opt) =>
                  currentUser ? opt.votes.includes(currentUser.id) : false
                )

                return (
                  <Card key={poll.id} className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3">
                    <div>
                      <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-0.5 w-max">
                        <Vote size={9} /> Votação Ativa
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5">{poll.question}</h4>
                    </div>

                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const isSelected = currentUser
                          ? opt.votes.includes(currentUser.id)
                          : false
                        const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0

                        return (
                          <button
                            key={opt.id}
                            disabled={!isUserMember}
                            onClick={() => handleVote(poll.id, opt.id)}
                            className={`w-full text-left rounded-lg p-2.5 border text-xs font-bold relative overflow-hidden transition-all duration-300 flex items-center justify-between ${
                              isSelected
                                ? 'border-primary text-white'
                                : 'border-[#2D2D2D] text-[#A0A0A0] hover:text-white'
                            }`}
                          >
                            {/* Vote Percentage Visual Fill */}
                            {hasVotedAny && (
                              <div
                                className="absolute inset-y-0 left-0 bg-primary/5 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            )}

                            <span className="relative z-10 flex items-center gap-2">
                              {isSelected && <Check size={12} className="text-primary shrink-0" />}
                              <span className="truncate">{opt.text}</span>
                            </span>

                            {hasVotedAny && (
                              <span className="relative z-10 text-[10px] font-black text-[#808080]">
                                {pct}% ({opt.voteCount})
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-[#808080] pt-1">
                      <span>Total de votos: {totalVotes}</span>
                      <span>Encerra em breve</span>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
                <p className="text-xs text-[#808080] italic">Nenhuma enquete ativa na tropa</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Poll Drawer */}
      <Sheet isOpen={isPollSheetOpen} onClose={() => setIsPollSheetOpen(false)} title="Nova Enquete">
        <div className="space-y-4 pb-8">
          {/* Question */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Qual a pergunta do bonde?
            </label>
            <input
              type="text"
              placeholder="Ex: Onde vamos amassar hoje?"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary font-bold"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
                Opções da Votação
              </label>
              {pollOptionsText.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOptionField}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  + Add Opção
                </button>
              )}
            </div>
            <div className="space-y-2">
              {pollOptionsText.map((text, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Opção ${idx + 1}`}
                  value={text}
                  onChange={(e) => {
                    const nextOpts = [...pollOptionsText]
                    nextOpts[idx] = e.target.value
                    setPollOptionsText(nextOpts)
                  }}
                  className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary"
                />
              ))}
            </div>
          </div>

          {/* Create CTA */}
          <Button
            onClick={handleCreatePoll}
            disabled={!pollQuestion.trim() || pollOptionsText.filter(t => t.trim() !== '').length < 2}
            className="w-full rounded-full font-bold py-3 mt-2"
          >
            Lançar Enquete 🚀
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
