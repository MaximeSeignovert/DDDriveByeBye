import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarDays, CarFront, Clock3, MapPin, Navigation, UserRound, Users, WalletCards, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/status-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMatch, getRide, type MatchDto, type RideDto } from '@/lib/api'
import { formatCoordinates } from '@/lib/demo-locations'
import { getStoredLastRide, type StoredRide } from '@/lib/demo-session'

type Trip = {
  id: string
  role: 'passager' | 'conducteur'
  from: string
  to: string
  eta: string
  status: string
  driverName?: string
  passengerName?: string
  pickupAddress?: string
  dropoffAddress?: string
  scheduledAt?: string
  vehicle?: string
  seats?: number
  price?: string
  notes?: string
}

type TripsData = {
  ongoing: Trip[]
  planned: Trip[]
  source?: 'api' | 'mock'
  match?: MatchDto
  errorMessage?: string
}

type TripDetails = {
  section: 'ongoing' | 'planned'
  trip: Trip
}

export const Route = createFileRoute('/trajets')({
  shouldReload: true,
  loader: async () => {
    const storedRide = getStoredLastRide()
    const rideId = storedRide?.rideId

    if (rideId) {
      if (rideId.startsWith('demo-') || storedRide?.departureLabel || storedRide?.destinationLabel) {
        return toDemoTripsData(storedRide)
      }

      try {
        const ride = await getRide(rideId)
        const match = await getMatch(rideId).catch(() => null)

        return toTripsData(ride, match, storedRide)
      } catch {
        return toDemoTripsData(storedRide)
      }
    }

    const response = await fetch('/mocks/trips-page.json')
    const data = (await response.json()) as TripsData
    return { ...data, source: 'mock' } satisfies TripsData
  },
  component: TripsPage,
})

function formatRidePrice(ride: RideDto) {
  if (!ride.priceAmount) return undefined

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: ride.priceCurrency || 'EUR',
  }).format(ride.priceAmount)
}

function formatScheduledAt(value: string | undefined) {
  if (!value) return 'Trajet planifie'

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function toTripsData(ride: RideDto, match: MatchDto | null, storedRide: StoredRide | null): TripsData {
  const isPlanned = storedRide?.kind === 'scheduled' || match?.kind === 'SCHEDULED'
  const scheduledAt = isPlanned ? formatScheduledAt(storedRide?.plannedAt) : undefined
  const trip: Trip = {
    id: ride.id,
    role: 'passager',
    from: formatCoordinates(ride.pickupLat, ride.pickupLon),
    to: formatCoordinates(ride.destLat, ride.destLon),
    eta: scheduledAt ?? (match?.status === 'ACCEPTED' ? 'Chauffeur accepte' : 'Matching en cours'),
    status: match?.status ?? ride.state,
    driverName: match?.acceptedDriverId ?? match?.proposedDriverId ?? undefined,
    pickupAddress: formatCoordinates(ride.pickupLat, ride.pickupLon),
    dropoffAddress: formatCoordinates(ride.destLat, ride.destLon),
    scheduledAt,
    seats: ride.requestedSeats,
    price: formatRidePrice(ride),
    notes: match?.failureReason ?? undefined,
  }

  return {
    ongoing: isPlanned ? [] : [trip],
    planned: isPlanned ? [trip] : [],
    source: 'api',
    match: match ?? undefined,
  }
}

function toDemoTripsData(storedRide: StoredRide | null): TripsData {
  const isPlanned = storedRide?.kind === 'scheduled'
  const from = storedRide?.departureLabel ?? 'Grenoble Gare'
  const to = storedRide?.destinationLabel ?? "Grenoble Presqu'ile"
  const scheduledAt = isPlanned ? formatScheduledAt(storedRide?.plannedAt) : undefined
  const trip: Trip = {
    id: storedRide?.rideId ?? 'demo-trip',
    role: 'passager',
    from,
    to,
    eta: scheduledAt ?? 'Chauffeur a 4 min',
    status: isPlanned ? 'Planifie' : 'VTC propose',
    driverName: isPlanned ? 'Chauffeur assigne prochainement' : 'Nadia B.',
    pickupAddress: from,
    dropoffAddress: to,
    scheduledAt,
    vehicle: isPlanned ? 'A confirmer' : 'Tesla Model 3 noire',
    seats: 1,
    price: isPlanned ? '18,50 EUR estime' : '18,50 EUR',
    notes: isPlanned
      ? 'Reservation mockee enregistree localement pour la demo. Elle reste visible dans cet onglet.'
      : 'Course immediate mockee issue de la derniere recherche passager.',
  }

  return {
    ongoing: isPlanned ? [] : [trip],
    planned: isPlanned ? [trip] : [],
    source: 'mock',
  }
}

function roleIcon(role: Trip['role']) {
  return role === 'conducteur' ? CarFront : UserRound
}

type TripCardProps = {
  section: TripDetails['section']
  trip: Trip
  onSelect: () => void
}

function TripCard({ section, trip, onSelect }: TripCardProps) {
  const Icon = roleIcon(trip.role)
  const isPlanned = section === 'planned'

  return (
    <button
      type="button"
      className="w-full rounded-lg border bg-background p-3 text-left transition hover:border-foreground/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onSelect}
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="secondary" className="inline-flex items-center gap-1">
          <Icon className="h-3.5 w-3.5" />
          {trip.role}
        </Badge>
        <Badge variant={isPlanned ? 'outline' : 'default'}>{trip.status}</Badge>
      </div>
      <p className="text-sm font-medium">
        {trip.from} {'->'} {trip.to}
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        {isPlanned ? <CalendarDays className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
        {isPlanned ? 'Depart' : 'ETA'}: {trip.eta}
      </p>
      <p className="mt-3 text-xs font-medium text-foreground">Toucher pour voir le detail</p>
    </button>
  )
}

function TripsPage() {
  const data = Route.useLoaderData()
  const [selectedTrip, setSelectedTrip] = useState<TripDetails | null>(null)
  const hasTrips = data.ongoing.length > 0 || data.planned.length > 0
  const defaultTab = data.ongoing.length > 0 ? 'ongoing' : 'planned'

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Page de Trajets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.source === 'api'
                ? 'Suivi de la derniere course creee via le back-end.'
                : 'Suivi des trajets en cours et des trajets prevus.'}
            </p>
            {data.match ? (
              <p className="text-sm text-muted-foreground">
                Matching: {data.match.kind} - {data.match.status}
              </p>
            ) : null}
            {data.errorMessage ? (
              <StatusState
                tone="error"
                title="Trajets indisponibles"
                description="La derniere course enregistree localement n'est plus recuperable. Tu peux relancer une recherche pour repartir sur une course fraiche."
                actionLabel="Reessayer"
                onAction={() => window.location.reload()}
                className="mt-4"
              />
            ) : null}
          </CardContent>
        </Card>

        {!data.errorMessage && !hasTrips ? (
          <StatusState
            title="Aucun trajet a suivre"
            description="Tes courses apparaitront ici des qu'une demande aura ete creee ou qu'un chauffeur aura accepte un trajet."
          />
        ) : null}

        {hasTrips ? (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ongoing">Trajets en cours</TabsTrigger>
                <TabsTrigger value="planned">Trajets planifies</TabsTrigger>
              </TabsList>

              <TabsContent value="ongoing" className="mt-4 space-y-2">
                {data.ongoing.length > 0 ? (
                  data.ongoing.map((trip) => (
                    <TripCard
                      key={trip.id}
                      section="ongoing"
                      trip={trip}
                      onSelect={() => setSelectedTrip({ section: 'ongoing', trip })}
                    />
                  ))
                ) : (
                  <StatusState
                    title="Aucun trajet en cours"
                    description="Les courses actives seront listees ici avec leur ETA et leur statut."
                  />
                )}
              </TabsContent>

              <TabsContent value="planned" className="mt-4 space-y-2">
                {data.planned.length > 0 ? (
                  data.planned.map((trip, index) => {
                    return (
                      <div key={trip.id}>
                        <TripCard
                          section="planned"
                          trip={trip}
                          onSelect={() => setSelectedTrip({ section: 'planned', trip })}
                        />
                        {index < data.planned.length - 1 ? <Separator className="my-2" /> : null}
                      </div>
                    )
                  })
                ) : (
                  <StatusState
                    title="Aucun trajet planifie"
                    description="Les reservations futures apparaitront ici des qu'un matching planifie sera cree."
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        ) : null}
      </div>

      <TripDetailsDrawer tripDetails={selectedTrip} onClose={() => setSelectedTrip(null)} />
    </>
  )
}

type TripDetailsDrawerProps = {
  tripDetails: TripDetails | null
  onClose: () => void
}

function TripDetailsDrawer({ tripDetails, onClose }: TripDetailsDrawerProps) {
  const trip = tripDetails?.trip
  const rows = trip
    ? [
        { label: 'Role', value: trip.role === 'conducteur' ? 'Conducteur' : 'Passager', icon: UserRound },
        { label: 'Statut', value: trip.status, icon: Navigation },
        {
          label: tripDetails.section === 'ongoing' ? 'ETA' : 'Depart',
          value: trip.scheduledAt ?? trip.eta,
          icon: tripDetails.section === 'ongoing' ? Clock3 : CalendarDays,
        },
        { label: 'Conducteur', value: trip.driverName, icon: CarFront },
        { label: 'Passager', value: trip.passengerName, icon: UserRound },
        { label: 'Vehicule', value: trip.vehicle, icon: CarFront },
        { label: 'Places', value: trip.seats ? `${trip.seats} place(s)` : undefined, icon: Users },
        { label: 'Prix estime', value: trip.price, icon: WalletCards },
      ].filter((row) => row.value)
    : []

  return (
    <Drawer open={tripDetails !== null} onOpenChange={(open) => (!open ? onClose() : null)} direction="bottom">
      <DrawerContent className="mx-auto max-h-[85dvh] w-full max-w-md overflow-hidden rounded-t-2xl border">
        {tripDetails && trip ? (
          <>
            <DrawerHeader className="border-b bg-background text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <DrawerTitle className="text-lg">Detail du trajet</DrawerTitle>
                  <DrawerDescription>
                    {trip.from} {'->'} {trip.to}
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button size="icon" variant="ghost" aria-label="Fermer">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Itineraire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Depart</p>
                      <p className="text-muted-foreground">{trip.pickupAddress ?? trip.from}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Navigation className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Arrivee</p>
                      <p className="text-muted-foreground">{trip.dropoffAddress ?? trip.to}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {rows.map((row) => {
                    const Icon = row.icon
                    return (
                      <div key={row.label} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{row.label}</p>
                          <p className="text-muted-foreground">{row.value}</p>
                        </div>
                      </div>
                    )
                  })}
                  {trip.notes ? (
                    <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground">{trip.notes}</div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
