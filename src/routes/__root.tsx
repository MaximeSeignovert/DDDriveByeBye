import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { BriefcaseBusiness, User, Search, Route as RouteIcon } from 'lucide-react'
import { useUserMode } from '@/lib/user-mode'

const navItems = [
  { to: '/recherche', label: 'Recherche', icon: Search },
  { to: '/trajets', label: 'Trajets', icon: RouteIcon },
  { to: '/user', label: 'User', icon: User },
] as const

const professionalNavItems = [
  { to: '/pro', label: 'Courses', icon: BriefcaseBusiness },
  { to: '/trajets', label: 'Trajets', icon: RouteIcon },
  { to: '/user', label: 'User', icon: User },
] as const

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const userMode = useUserMode()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isSearchMapPage = pathname === '/recherche' || pathname === '/recherche/'
  const visibleNavItems = userMode === 'professionnel' ? professionalNavItems : navItems

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-muted/30">
        <main className={isSearchMapPage ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto px-4 pb-24 pt-4'}>
          <Outlet />
        </main>
        <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-1 flex-col items-center gap-1 px-2 py-3 text-xs text-muted-foreground transition-colors [&.active]:text-foreground"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}