import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/recherche')({
  component: SearchPage,
})

function SearchPage() {
  return <Outlet />
}
