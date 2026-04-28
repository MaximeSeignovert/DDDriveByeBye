import { createFileRoute, Link } from '@tanstack/react-router'
import { BriefcaseBusiness, Clock3, MapPin, Navigation } from 'lucide-react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserMode } from '@/lib/user-mode'

type ProfessionalRide = {
  id: string
  from: string
  to: string
  pickup: [number, number]
  dropoff: [number, number]
  requestedAt: string
  price: string
  distance: string
}

type ProfessionalRidesData = {
  rides: ProfessionalRide[]
}

export const Route = createFileRoute('/pro')({
  loader: async () => {
    const response = await fetch('/mocks/pro-rides-page.json')
    return (await response.json()) as ProfessionalRidesData
  },
  component: ProfessionalPage,
})

function ProfessionalPage() {
  const data = Route.useLoaderData()
  const userMode = useUserMode()

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
          <CardTitle className="text-xl">Courses disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les points sur la carte indiquent les departs de courses disponibles.
          </p>
        </CardContent>
      </Card>

      <div className="relative overflow-hidden rounded-xl border bg-background">
        <MapContainer
          center={[45.755, 4.85]}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.rides.map((ride) => (
            <CircleMarker
              key={ride.id}
              center={ride.pickup}
              radius={10}
              pathOptions={{ color: '#111827', fillColor: '#111827', fillOpacity: 0.85 }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{ride.price}</p>
                  <p>
                    {ride.from} {'->'} {ride.to}
                  </p>
                  <p>{ride.requestedAt}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="space-y-2">
        {data.rides.map((ride) => (
          <Card key={ride.id}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {ride.from} {'->'} {ride.to}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {ride.requestedAt}
                  </p>
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
              <Button className="w-full">Accepter la course</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
