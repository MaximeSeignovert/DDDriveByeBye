import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CalendarDays, MapPin } from 'lucide-react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MatchKind } from '@/lib/api'
import { demoLocations, resolveDemoLocation } from '@/lib/demo-locations'
import { createDemoRideId, storeLastRide } from '@/lib/demo-session'
import { getMapTileLayer } from '@/lib/map-tiles'
import { useTheme } from '@/lib/theme'

type SearchData = {
  destinationPlaceholder: string
  departurePlaceholder: string
}

type MapPoint = [number, number]

function getFallbackPlannedAt() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
  date.setMinutes(0, 0, 0)
  return date.toISOString()
}

function getRouteLine(start: MapPoint, end: MapPoint): MapPoint[] {
  const middle: MapPoint = [
    (start[0] + end[0]) / 2 + 0.004,
    (start[1] + end[1]) / 2 - 0.004,
  ]

  return [start, middle, end]
}

function MapViewport({ routeLine }: { routeLine: MapPoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (routeLine.length < 2) return

    map.fitBounds(routeLine, { animate: true, padding: [48, 48] })
  }, [map, routeLine])

  return null
}

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Provider de position bloque, position demo utilisee.'
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Provider de position indisponible, position demo utilisee.'
  }

  if (error.code === error.TIMEOUT) {
    return 'Signal GPS trop lent, position demo utilisee.'
  }

  return 'Geolocalisation impossible, position demo utilisee.'
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
  const [departure, setDeparture] = useState(demoLocations[0].label)
  const [destination, setDestination] = useState(demoLocations[1].label)
  const [plannedAt, setPlannedAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<MapPoint | null>(null)
  const [isUsingDemoLocation, setIsUsingDemoLocation] = useState(false)
  const [locationMessage, setLocationMessage] = useState('Geolocalisation en attente...')
  const [isLocating, setIsLocating] = useState(false)
  const mapTileLayer = getMapTileLayer(theme)
  const departureLocation = resolveDemoLocation(departure, demoLocations[0])
  const destinationLocation = resolveDemoLocation(destination, demoLocations[1])
  const routeStart = useMemo<MapPoint>(
    () =>
      !isPlanned && userLocation
        ? userLocation
        : [departureLocation.latitude, departureLocation.longitude],
    [departureLocation.latitude, departureLocation.longitude, isPlanned, userLocation],
  )
  const routeEnd = useMemo<MapPoint>(
    () => [destinationLocation.latitude, destinationLocation.longitude],
    [destinationLocation.latitude, destinationLocation.longitude],
  )
  const routeLine = useMemo(() => getRouteLine(routeStart, routeEnd), [routeStart, routeEnd])

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocalisation non disponible sur ce navigateur.')
      return
    }

    setIsLocating(true)
    setLocationMessage('Recherche de ta position...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Position actuelle', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setIsUsingDemoLocation(false)
        setLocationMessage('Position actuelle detectee.')
        setIsLocating(false)
      },
      (error) => {
        const fallbackLocation = demoLocations[0]

        console.warn('Geolocalisation indisponible, fallback demo utilise', {
          code: error.code,
          message: error.message,
          fallback: fallbackLocation.label,
        })
        setUserLocation([fallbackLocation.latitude, fallbackLocation.longitude])
        setIsUsingDemoLocation(true)
        setLocationMessage(getGeolocationErrorMessage(error))
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    )
  }, [])

  useEffect(() => {
    requestUserLocation()
  }, [requestUserLocation])

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const pickup = !isPlanned && userLocation
        ? {
            label: isUsingDemoLocation ? `Position demo - ${demoLocations[0].label}` : 'Ma position actuelle',
            latitude: userLocation[0],
            longitude: userLocation[1],
          }
        : departureLocation
      const kind: MatchKind = isPlanned ? 'scheduled' : 'immediate'
      const rideId = createDemoRideId(kind)

      storeLastRide({
        rideId,
        kind,
        plannedAt: isPlanned ? plannedAt || getFallbackPlannedAt() : undefined,
        departureLabel: pickup.label,
        destinationLabel: destinationLocation.label,
        pickupLat: pickup.latitude,
        pickupLon: pickup.longitude,
        destLat: destinationLocation.latitude,
        destLon: destinationLocation.longitude,
        createdAt: new Date().toISOString(),
      })

      if (isPlanned) {
        await navigate({ to: '/trajets' })
        return
      }

      await navigate({ to: '/recherche/resultats', search: { rideId, kind } })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Impossible de lancer la recherche.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative h-full min-h-screen overflow-hidden">
      <MapContainer
        center={[45.1885, 5.7245]}
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
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: theme === 'dark' ? '#38bdf8' : '#0f172a',
            opacity: 0.9,
            weight: 5,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <CircleMarker
          center={routeStart}
          radius={9}
          pathOptions={{
            color: theme === 'dark' ? '#67e8f9' : '#0284c7',
            fillColor: theme === 'dark' ? '#67e8f9' : '#0ea5e9',
            fillOpacity: 0.95,
            weight: 3,
          }}
        >
          <Popup>
            {!isPlanned && userLocation
              ? isUsingDemoLocation
                ? `Position demo - ${demoLocations[0].label}`
                : 'Vous etes ici'
              : departureLocation.label}
          </Popup>
        </CircleMarker>
        <CircleMarker
          center={routeEnd}
          radius={10}
          pathOptions={{
            color: theme === 'dark' ? '#fb923c' : '#111827',
            fillColor: theme === 'dark' ? '#fb923c' : '#111827',
            fillOpacity: 0.9,
            weight: 3,
          }}
        >
          <Popup>Destination: {destinationLocation.label}</Popup>
        </CircleMarker>
        <MapViewport routeLine={routeLine} />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.38),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.16),transparent_42%,rgba(15,23,42,0.22))] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.04),transparent_42%,rgba(2,6,23,0.48))]" />

      <form
        className="relative z-10 mx-4 mt-4 overflow-hidden rounded-4xl border border-white/55 bg-white/35 p-3.5 shadow-[0_24px_70px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-3xl dark:border-white/15 dark:bg-slate-950/35 dark:shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)]"
        onSubmit={submitSearch}
      >
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent" />
        <span className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-white/35 blur-3xl dark:bg-cyan-300/10" />
        <span className="pointer-events-none absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl dark:bg-blue-500/10" />

        <div className="relative space-y-3">
          <datalist id="demo-locations">
            {demoLocations.map((location) => (
              <option key={location.label} value={location.label} />
            ))}
          </datalist>

          <div className="space-y-2">
            <Label htmlFor="destination" className="px-1 text-[0.8rem] font-semibold text-slate-950/75 dark:text-white/80">
              Je veux aller ...
            </Label>
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-xs font-medium text-slate-800/70 dark:text-white/65">
                {locationMessage}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 rounded-full px-2 text-xs"
                onClick={requestUserLocation}
                disabled={isLocating}
              >
                {isLocating ? '...' : 'Reessayer'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="destination"
                placeholder={data.destinationPlaceholder}
                list="demo-locations"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
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
                    value={plannedAt}
                    onChange={(event) => setPlannedAt(event.target.value)}
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
                    list="demo-locations"
                    value={departure}
                    onChange={(event) => setDeparture(event.target.value)}
                    disabled={!isPlanned}
                    className="h-11 rounded-2xl border-white/50 bg-white/50 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] placeholder:text-slate-600/70 focus-visible:border-white/80 focus-visible:ring-white/50 disabled:cursor-default disabled:opacity-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/45"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-slate-950/95 text-[0.95rem] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.26),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-slate-900 dark:bg-white/90 dark:text-slate-950 dark:hover:bg-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Recherche en cours...' : 'Rechercher un trajet'}
          </Button>
          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
