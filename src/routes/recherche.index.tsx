import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CalendarDays, MapPin } from 'lucide-react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getMapTileLayer } from '@/lib/map-tiles'
import { useTheme } from '@/lib/theme'

type SearchData = {
  destinationPlaceholder: string
  departurePlaceholder: string
}

export const Route = createFileRoute('/recherche/')({
  loader: async () => {
    const response = await fetch('/mocks/search-page.json')
    return (await response.json()) as SearchData
  },
  component: SearchForm,
})

function SearchForm() {
  const data = Route.useLoaderData()
  const navigate = useNavigate()
  const theme = useTheme()
  const [isPlanned, setIsPlanned] = useState(false)
  const mapTileLayer = getMapTileLayer(theme)

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
          key={theme}
          attribution={mapTileLayer.attribution}
          url={mapTileLayer.url}
        />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.38),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.16),transparent_42%,rgba(15,23,42,0.22))] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.04),transparent_42%,rgba(2,6,23,0.48))]" />

      <div className="relative z-10 mx-4 mt-4 overflow-hidden rounded-4xl border border-white/55 bg-white/35 p-3.5 shadow-[0_24px_70px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-3xl dark:border-white/15 dark:bg-slate-950/35 dark:shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)]">
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent" />
        <span className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-white/35 blur-3xl dark:bg-cyan-300/10" />
        <span className="pointer-events-none absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl dark:bg-blue-500/10" />

        <div className="relative space-y-3">
          <div className="space-y-2">
            <Label htmlFor="destination" className="px-1 text-[0.8rem] font-semibold text-slate-950/75 dark:text-white/80">
              Je veux aller ...
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="destination"
                placeholder={data.destinationPlaceholder}
                className="h-12 rounded-2xl border-white/55 bg-white/55 px-4 text-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_28px_rgba(15,23,42,0.08)] placeholder:text-slate-600/70 focus-visible:border-white/80 focus-visible:ring-white/50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/45"
              />
              <Button
                type="button"
                variant={isPlanned ? 'default' : 'outline'}
                className={
                  isPlanned
                    ? 'h-12 rounded-2xl bg-slate-950/90 px-4 text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)] hover:bg-slate-900 dark:bg-white/90 dark:text-slate-950 dark:hover:bg-white'
                    : 'h-12 rounded-2xl border-white/55 bg-white/40 px-4 text-slate-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_rgba(15,23,42,0.08)] hover:bg-white/65 dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15'
                }
                onClick={() => setIsPlanned((prev) => !prev)}
              >
                Planifier
              </Button>
            </div>
          </div>

          <div
            aria-hidden={!isPlanned}
            className={
              isPlanned
                ? 'grid grid-rows-[1fr] opacity-100 translate-y-0 transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none'
                : 'pointer-events-none grid grid-rows-[0fr] -translate-y-2 opacity-0 transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none'
            }
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 rounded-3xl border border-white/45 bg-white/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:bg-white/8">
                <div className="space-y-2">
                  <Label htmlFor="planned-date" className="inline-flex items-center gap-2 px-1 text-[0.8rem] font-semibold text-slate-950/75 dark:text-white/80">
                    <CalendarDays className="h-4 w-4" />
                    Date du trajet
                  </Label>
                  <Input
                    id="planned-date"
                    type="datetime-local"
                    disabled={!isPlanned}
                    className="h-11 rounded-2xl border-white/50 bg-white/50 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] focus-visible:border-white/80 focus-visible:ring-white/50 disabled:cursor-default disabled:opacity-100 dark:border-white/15 dark:bg-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure" className="inline-flex items-center gap-2 px-1 text-[0.8rem] font-semibold text-slate-950/75 dark:text-white/80">
                    <MapPin className="h-4 w-4" />
                    Lieu de depart
                  </Label>
                  <Input
                    id="departure"
                    placeholder={data.departurePlaceholder}
                    disabled={!isPlanned}
                    className="h-11 rounded-2xl border-white/50 bg-white/50 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] placeholder:text-slate-600/70 focus-visible:border-white/80 focus-visible:ring-white/50 disabled:cursor-default disabled:opacity-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/45"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="h-12 w-full rounded-2xl bg-slate-950/95 text-[0.95rem] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.26),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-slate-900 dark:bg-white/90 dark:text-slate-950 dark:hover:bg-white"
            onClick={() => navigate({ to: '/recherche/resultats' })}
          >
            Rechercher un trajet
          </Button>
        </div>
      </div>
    </section>
  )
}
