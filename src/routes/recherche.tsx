import { useState } from 'react'
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { CalendarDays, MapPin } from 'lucide-react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type SearchData = {
  destinationPlaceholder: string
  departurePlaceholder: string
}

export const Route = createFileRoute('/recherche')({
  loader: async () => {
    const response = await fetch('/mocks/search-page.json')
    return (await response.json()) as SearchData
  },
  component: SearchPage,
})

function SearchPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return pathname === '/recherche' ? <SearchForm /> : <Outlet />
}

function SearchForm() {
  const data = Route.useLoaderData()
  const navigate = useNavigate()
  const [isPlanned, setIsPlanned] = useState(false)

  return (
    <section className="relative h-full min-h-screen overflow-hidden">
      <MapContainer
        center={[45.764, 4.8357]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom
        className="absolute inset-0 z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-background/15 via-transparent to-background/30" />

      <div className="relative z-10 mx-4 mt-4 space-y-3 rounded-xl border bg-background/90 p-3 shadow-sm backdrop-blur">
        <div className="space-y-2">
          <Label htmlFor="destination">Je veux aller ...</Label>
          <div className="flex items-center gap-2">
            <Input id="destination" placeholder={data.destinationPlaceholder} />
            <Button
              type="button"
              variant={isPlanned ? 'default' : 'outline'}
              onClick={() => setIsPlanned((prev) => !prev)}
            >
              Planifier
            </Button>
          </div>
        </div>

        {isPlanned && (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
            <div className="space-y-2">
              <Label htmlFor="planned-date" className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date du trajet
              </Label>
              <Input id="planned-date" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure" className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lieu de depart
              </Label>
              <Input id="departure" placeholder={data.departurePlaceholder} />
            </div>
          </div>
        )}

        <Button type="button" className="w-full" onClick={() => navigate({ to: '/recherche/resultats' })}>
          Rechercher un trajet
        </Button>
      </div>
    </section>
  )
}
