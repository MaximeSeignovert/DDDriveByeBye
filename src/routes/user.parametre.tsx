import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/user/parametre')({
  component: UserParametrePage,
})

function UserParametrePage() {
  return <Outlet />
}
