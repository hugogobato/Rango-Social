import { Bell } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { useNotifications, useSessionUser } from '../../lib/query/hooks'
import { copy } from '../../copy/pt-BR'

export function NotificationsScreen() {
  const { data: sessionUser } = useSessionUser()
  const { data: notifications, isLoading } = useNotifications(sessionUser?.id || 'u_me')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Bell className="text-primary" />
          <span>{copy.notifications.title}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">{copy.notifications.subtitle}</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-xs text-[#808080]">Carregando fofocas...</div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card key={notif.id} className={`border-[#2D2D2D] bg-[#1A1A1A] p-4 ${!notif.isRead ? 'border-l-4 border-l-primary' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#242424] text-xs font-extrabold">
                  {notif.actor?.displayName ? notif.actor.displayName.slice(0, 2).toUpperCase() : '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white">
                    <span className="font-bold">@{notif.actor?.username || 'sistema'}</span> {notif.message}
                  </p>
                  <p className="text-[10px] text-[#808080] mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 text-xs text-[#808080] italic">
            {copy.loading.emptyNoNotifications}
          </div>
        )}
      </div>
    </div>
  )
}
