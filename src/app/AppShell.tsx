import { Suspense, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Home, Trophy, Plus, Bell, User, Sparkles } from 'lucide-react'
import { copy } from '../copy/pt-BR'
import { ScreenSkeleton } from '../components/shared/Skeletons'

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const currentPath = location.pathname

  useEffect(() => {
    const completed = localStorage.getItem('hasCompletedOnboarding') === 'true'
    if (!completed) {
      navigate('/onboarding')
    }
  }, [navigate])

  const isTabActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true
    if (path !== '/' && currentPath.startsWith(path)) return true
    return false
  }

  const navItemClass = (path: string) =>
    `flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
      isTabActive(path)
        ? 'text-primary scale-105 font-semibold'
        : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <div className="safe-bottom flex min-h-screen flex-col bg-background pb-[72px] text-foreground">
      {/* Top Header */}
      <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border px-4 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-primary">
            {copy.app.name}
          </span>
        </Link>

        {/* AI Agent trigger shortcut */}
        <Link
          to="/ai"
          className="bg-secondary/15 hover:bg-secondary/20 border-secondary/20 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold text-secondary shadow-[0_0_10px_rgba(123,97,255,0.15)] transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles size={13} className="animate-pulse" />
          <span>{copy.ai.chatTitle}</span>
        </Link>
      </header>

      {/* Main Content Page Area */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <Suspense fallback={<ScreenSkeleton />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPath}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Bottom Sticky Tab Navigation */}
      <nav className="pb-safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#1A1A1A]/90 px-4 backdrop-blur-lg">
        <div className="relative mx-auto flex h-16 max-w-md items-center justify-between">
          {/* Tab 1: Home */}
          <Link to="/" className={navItemClass('/')} aria-label={copy.nav.home}>
            <Home size={22} />
            <span className="mt-1 text-[10px]">{copy.nav.home}</span>
          </Link>

          {/* Tab 2: Ranking */}
          <Link
            to="/ranking"
            className={navItemClass('/ranking')}
            aria-label={copy.nav.ranking}
          >
            <Trophy size={22} />
            <span className="mt-1 text-[10px]">{copy.nav.ranking}</span>
          </Link>

          {/* Tab 3: FAB Central ➕ */}
          <div className="flex flex-1 -translate-y-4 justify-center">
            <Link
              to="/review"
              className="flex h-14 w-14 transform items-center justify-center rounded-full border-4 border-background bg-gradient-to-tr from-primary to-[#FF8C61] text-primary-foreground shadow-[0_0_15px_rgba(255,107,53,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_22px_rgba(255,107,53,0.6)] active:scale-95"
              aria-label={copy.nav.review}
            >
              <Plus size={28} className="stroke-[3px]" />
            </Link>
          </div>

          {/* Tab 4: Notifications */}
          <Link
            to="/notifications"
            className={navItemClass('/notifications')}
            aria-label={copy.nav.notifications}
          >
            <div className="relative">
              <Bell size={22} />
              {/* Mock notification dot */}
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-primary" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </div>
            <span className="mt-1 text-[10px]">{copy.nav.notifications}</span>
          </Link>

          {/* Tab 5: Profile */}
          <Link
            to="/profile"
            className={navItemClass('/profile')}
            aria-label={copy.nav.profile}
          >
            <User size={22} />
            <span className="mt-1 text-[10px]">{copy.nav.profile}</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
