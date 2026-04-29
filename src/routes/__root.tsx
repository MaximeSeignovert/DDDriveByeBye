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

function getNavTransitionType(activeIndex: number, targetIndex: number) {
  return activeIndex !== -1 && targetIndex < activeIndex ? 'slide-right' : 'slide-left'
}

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const userMode = useUserMode()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isSearchMapPage = pathname === '/recherche' || pathname === '/recherche/'
  const visibleNavItems = userMode === 'professionnel' ? professionalNavItems : navItems
  const activeNavIndex = visibleNavItems.findIndex(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  )

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-muted/30">
        <main
          className={
            isSearchMapPage
              ? 'route-transition-frame flex-1 overflow-hidden'
              : 'route-transition-frame flex-1 overflow-y-auto px-4 pb-28 pt-4'
          }
        >
          <Outlet />
        </main>
        <nav className="bottom-nav-transition fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-104 -translate-x-1/2 rounded-full border border-white/40 bg-background/55 p-1 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-2xl supports-backdrop-filter:bg-background/40">
          <span
            className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-full border border-white/60 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_24px_rgba(15,23,42,0.12)] transition-[opacity,transform] duration-300 ease-out"
            style={{
              opacity: activeNavIndex === -1 ? 0 : 1,
              transform: `translateX(${Math.max(activeNavIndex, 0) * 100}%)`,
            }}
          />
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                viewTransition={{ types: [getNavTransitionType(activeNavIndex, index)] }}
                className="relative z-10 flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-2.5 text-xs font-medium text-muted-foreground transition-colors duration-300 [&.active]:font-semibold [&.active]:text-foreground"
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