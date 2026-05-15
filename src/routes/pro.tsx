import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { BriefcaseBusiness, Clock3, MapPin, Navigation } from 'lucide-react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/status-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAvailableDrivers, searchNearbyDrivers, updateDriverPosition, type AvailableDriverDto } from '@/lib/api'
import { demoLocations } from '@/lib/demo-locations'
import { ensureDriverId, getStoredDriverId } from '@/lib/demo-session'
import { getMapTileLayer } from '@/lib/map-tiles'
import { useTheme } from '@/lib/theme'
import { useUserMode } from '@/lib/user-mode'

type ProfessionalRide = {
  id: string
  from: string
  to: string
  pickup: [number, number]
  dropoff: [number, number]
  requestedAt: string
  passengerName?: string
  duration?: string
  status?: string
  price: string
  distance: string
}

type ProfessionalRidesData = {
  rides: ProfessionalRide[]
  availableDrivers?: AvailableDriverDto[]
  source: 'api' | 'mock'
  errorMessage?: string
}

export const Route = createFileRoute('/pro')({
  loader: async () => {
    const center = demoLocations[0]

    try {
      const availableDrivers = await getAvailableDrivers({
        latitude: center.latitude,
        longitude: center.longitude,
        radiusKm: 10,
        accountType: 'PROFESSIONAL',
      })
      const nearbyDrivers = await searchNearbyDrivers(center.latitude, center.longitude, 10).catch(() => [])

      if (availableDrivers.length === 0) {
        const response = await fetch('/mocks/pro-rides-page.json')
        const data = (await response.json()) as Omit<ProfessionalRidesData, 'source'>
        return { ...data, source: 'mock' } satisfies ProfessionalRidesData
      }

      return {
        source: 'api',
        availableDrivers,
        errorMessage: undefined,
        rides: availableDrivers.map((driver) => {
          const nearbyDriver = nearbyDrivers.find((item) => item.driverId === driver.driverId)

          return {
            id: driver.driverId,
            from: 'Position chauffeur',
            to: driver.accountType,
            pickup: [driver.latitude, driver.longitude],
            dropoff: [center.latitude, center.longitude],
            requestedAt: 'Disponible maintenant',
            passengerName: 'Passager API',
            duration: 'Temps estime en attente',
            status: 'A proposer',
            price: 'Disponible',
            distance: nearbyDriver ? `${nearbyDriver.distanceKm.toFixed(1)} km` : 'Rayon 10 km',
          } satisfies ProfessionalRide
        }),
      } satisfies ProfessionalRidesData
    } catch (error) {
      // Le back peut etre eteint pendant le developpement front.
      const response = await fetch('/mocks/pro-rides-page.json')
      const data = (await response.json()) as Omit<ProfessionalRidesData, 'source'>
      return {
        ...data,
        source: 'mock',
        errorMessage: error instanceof Error ? error.message : 'API indisponible.',
      } satisfies ProfessionalRidesData
    }
  },
  component: ProfessionalPage,
})

function ProfessionalPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const theme = useTheme()
  const userMode = useUserMode()
  const mapTileLayer = getMapTileLayer(theme)
  const hasDriverSession = Boolean(getStoredDriverId())
  const [syncError, setSyncError] = useState<string | null>(null)

  const syncDriverPosition = async () => {
    setSyncError(null)

    try {
      const driverId = await ensureDriverId()
      const location = demoLocations[0]

      await updateDriverPosition(driverId, location.latitude, location.longitude)
      await router.invalidate()
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Impossible de synchroniser la position.')
    }
  }

  if (userMode !== 'professionnel') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Mode professionnel inactif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Active le mode professionnel depuis tes parametres pour voir les courses disponibles.
            </p>
            <Button asChild className="w-full">
              <Link to="/user">Changer de mode</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-xl">Courses demandees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.source === 'api'
              ? 'Demandes passagers recuperees depuis le back-end.'
              : 'Mode demo: demandes passagers disponibles maintenant autour de Grenoble.'}
          </p>
          {data.errorMessage ? (
            <StatusState
              tone="offline"
              title="Mode demo actif"
              description="Le back ne repond pas encore pour les demandes conducteur. Les courses ci-dessous sont des donnees de secours pour la demo."
              className="mt-4"
            />
          ) : null}
          {syncError ? (
            <StatusState
              tone="error"
              title="Position non synchronisee"
              description="Le profil chauffeur ou la zone geographique n'a pas pu etre mise a jour. Verifie que le back est lance puis reessaie."
              actionLabel="Reessayer"
              onAction={syncDriverPosition}
              className="mt-4"
            />
          ) : null}
          <Button type="button" className="mt-3 w-full" onClick={syncDriverPosition}>
            {hasDriverSession ? 'Synchroniser ma position chauffeur' : 'Creer mon profil chauffeur de demo'}
          </Button>
        </CardContent>
      </Card>

      <div className="relative overflow-hidden rounded-xl border bg-background">
        <MapContainer
          center={[45.1885, 5.7245]}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom
          className="h-[420px] w-full"
        >
          <TileLayer
            key={theme}
            attribution={mapTileLayer.attribution}
            url={mapTileLayer.url}
          />
          {data.rides.map((ride) => (
            <CircleMarker
              key={ride.id}
              center={ride.pickup}
              radius={10}
              pathOptions={{
                color: theme === 'dark' ? '#f97316' : '#111827',
                fillColor: theme === 'dark' ? '#f97316' : '#111827',
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{ride.price}</p>
                  <p>
                    {ride.from} {'->'} {ride.to}
                  </p>
                  <p>{ride.passengerName ?? 'Passager'} - {ride.requestedAt}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="space-y-2">
        {data.rides.length > 0 ? data.rides.map((ride) => (
          <Card key={ride.id}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {ride.status ? <Badge variant="secondary" className="mb-2">{ride.status}</Badge> : null}
                  <p className="text-sm font-medium">
                    {ride.from} {'->'} {ride.to}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {ride.requestedAt}{ride.duration ? ` - ${ride.duration}` : ''}
                  </p>
                  {ride.passengerName ? (
                    <p className="mt-1 text-xs text-muted-foreground">Passager: {ride.passengerName}</p>
                  ) : null}
                </div>
                <Badge>{ride.price}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" />
                  {ride.distance}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Depart sur carte
                </span>
              </div>
              <Button className="w-full" variant={data.source === 'api' ? 'outline' : 'default'} disabled={data.source === 'api'}>
                {data.source === 'api' ? 'En attente de proposition matching' : 'Accepter la course'}
              </Button>
            </CardContent>
          </Card>
        )) : (
          <StatusState
            title="Aucun chauffeur disponible"
            description="Aucun profil n'est disponible dans ce rayon. Synchronise ta position ou augmente la zone de recherche cote back."
          />
        )}
      </div>
    </div>
  )
}
