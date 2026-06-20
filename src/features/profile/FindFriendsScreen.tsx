import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, UserCheck, Users } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import {
  useSessionUser,
  useSearchUsers,
  useSuggestedUsers,
  useFollowingIds,
  useToggleFollow,
} from '../../lib/query/hooks'
import type { User } from '../../domain/models'

export function FindFriendsScreen() {
  const [query, setQuery] = useState('')
  const { data: sessionUser } = useSessionUser()
  const myId = sessionUser?.id ?? ''

  const trimmed = query.trim()
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(trimmed)
  const { data: suggested, isLoading: isSuggesting } = useSuggestedUsers(myId)
  const { data: followingIds } = useFollowingIds(myId)
  const toggleFollow = useToggleFollow()

  const followingSet = new Set(followingIds ?? [])

  const handleToggle = (target: User) => {
    if (!myId) return
    const isFollowing = followingSet.has(target.id)
    toggleFollow.mutate(
      { followerId: myId, followingId: target.id, follow: !isFollowing },
      {
        onSuccess: () =>
          toast(
            isFollowing
              ? `Deixou de seguir @${target.username}`
              : `Agora segue @${target.username} 👊`,
            'success'
          ),
        onError: () => toast('Deu ruim, tenta de novo.', 'error'),
      }
    )
  }

  // When searching, show only people other than me; otherwise show suggestions.
  const list = (trimmed ? searchResults : suggested)?.filter(
    (u) => u.id !== myId
  )
  const loading = trimmed ? isSearching : isSuggesting

  return (
    <div className="space-y-5 max-w-md mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Users className="text-primary" size={20} />
        <h1 className="text-xl font-extrabold text-white">Achar a galera</h1>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por @ ou nome…"
          className="w-full rounded-full border border-[#2D2D2D] bg-[#1A1A1A] py-3 pl-9 pr-4 text-sm text-white outline-none focus:border-primary"
        />
      </div>

      {!trimmed && (
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#808080]">
          Sugestões pra você
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center text-xs text-[#808080]">Procurando…</p>
      ) : !list || list.length === 0 ? (
        <div className="py-12 text-center space-y-1.5">
          <p className="text-xs text-[#808080] italic">
            {trimmed
              ? 'Ninguém encontrado com esse nome.'
              : 'Você é dos primeiros do bonde! Convida a galera pra testar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((u) => {
            const isFollowing = followingSet.has(u.id)
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-[#2D2D2D] bg-[#1A1A1A] p-2.5"
              >
                <Link to={`/profile/${u.id}`}>
                  <Avatar
                    src={u.avatarUrl || undefined}
                    fallback={u.displayName.slice(0, 2).toUpperCase()}
                    size="sm"
                  />
                </Link>
                <Link to={`/profile/${u.id}`} className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-white">
                    {u.displayName}
                  </p>
                  <p className="truncate text-[11px] text-[#808080]">
                    @{u.username}
                  </p>
                </Link>
                <Button
                  onClick={() => handleToggle(u)}
                  disabled={toggleFollow.isPending}
                  variant={isFollowing ? 'outline' : 'primary'}
                  className={
                    isFollowing
                      ? 'rounded-full border-[#2D2D2D] text-[11px] h-8 px-3 text-[#A0A0A0] hover:bg-transparent'
                      : 'rounded-full text-[11px] h-8 px-4'
                  }
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={12} className="mr-1" /> Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} className="mr-1" /> Seguir
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FindFriendsScreen
