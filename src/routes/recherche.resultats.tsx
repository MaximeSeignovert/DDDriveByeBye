import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CarFront, Clock3, Coins, ShieldCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/status-state'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { getMatch, getRide, type MatchDto, type MatchKind, type RideDto } from '@/lib/api'
import { formatCoordinates } from '@/lib/demo-locations'
import { getStoredLastRide, type StoredRide } from '@/lib/demo-session'

type RideshareTrip = {
  id: string
  driverName: string
  rating: number
  from: string
  to: string
  departureIn: string
  seatsLeft: number
}

type VtcTrip = {
  id: string
  company: string
  vehicle: string
  from: string
  to: string
  waitTime: string
  duration: string
  price: string
}

type SearchResultsData = {
  rideshare: RideshareTrip[]
  vtc: VtcTrip[]
  match?: MatchDto
  ride?: RideDto
  errorMessage?: string
}

type TripDetails =
  | { kind: 'rideshare'; trip: RideshareTrip }
  | { kind: 'vtc'; trip: VtcTrip }

export const Route = createFileRoute('/recherche/resultats')({
  validateSearch: (search: Record<string, unknown>) => ({
    rideId: typeof search.rideId === 'string' ? search.rideId : undefined,
    kind: search.kind === 'scheduled' ? 'scheduled' : 'immediate',
  }) satisfies { rideId?: string; kind: MatchKind },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.rideId) {
      const storedRide = getStoredLastRide()

      if (storedRide?.rideId === deps.rideId) {
        return toDemoSearchResultsData(storedRide)
      }

      try {
        const [ride, match] = await Promise.all([getRide(deps.rideId), getMatch(deps.rideId)])
        return toSearchResultsData(ride, match)
      } catch (error) {
        const response = await fetch('/mocks/search-results-page.json')
        const data = (await response.json()) as SearchResultsData
        return {
          ...data,
          errorMessage: error instanceof Error ? error.message : 'Impossible de recuperer les resultats.',
        } satisfies SearchResultsData
      }
    }

    const response = await fetch('/mocks/search-results-page.json')
    return (await response.json()) as SearchResultsData
  },
  component: SearchResultsPage,
})

function formatPrice(ride: RideDto) {
  if (!ride.priceAmount) return 'Prix en attente'

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: ride.priceCurrency || 'EUR',
  }).format(ride.priceAmount)
}

function formatMatchWaitTime(match: MatchDto) {
  if (match.proposalExpiresAt) {
    return `Proposition jusqu'a ${new Date(match.proposalExpiresAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  return match.status === 'SEARCHING' ? 'Recherche en cours' : match.status
}

function toDemoSearchResultsData(storedRide: StoredRide): SearchResultsData {
  const from = storedRide.departureLabel ?? 'Grenoble Gare'
  const to = storedRide.destinationLabel ?? "Grenoble Presqu'ile"

  return {
    rideshare: [],
    vtc: [
      {
        id: 'demo-vtc-1',
        company: 'Alpine VTC',
        vehicle: 'Tesla Model 3 noire',
        from,
        to,
        waitTime: '4 min',
        duration: '12 min',
        price: '18,50 EUR',
      },
      {
        id: 'demo-vtc-2',
        company: 'Isere Premium Cab',
        vehicle: 'Peugeot 508 hybride',
        from,
        to,
        waitTime: '7 min',
        duration: '14 min',
        price: '16,90 EUR',
      },
      {
        id: 'demo-vtc-3',
        company: 'Grenoble Business Driver',
        vehicle: 'Mercedes Classe C',
        from,
        to,
        waitTime: '9 min',
        duration: '11 min',
        price: '22,40 EUR',
      },
    ],
  }
}

function toSearchResultsData(ride: RideDto, match: MatchDto): SearchResultsData {
  const driverId = match.acceptedDriverId ?? match.proposedDriverId
  const from = formatCoordinates(ride.pickupLat, ride.pickupLon)
  const to = formatCoordinates(ride.destLat, ride.destLon)

  return {
    ride,
    match,
    rideshare: [],
    vtc: driverId
      ? [
          {
            id: driverId,
            company: `Chauffeur ${driverId.slice(0, 8)}`,
            vehicle: 'Vehicule chauffeur',
            from,
            to,
            waitTime: formatMatchWaitTime(match),
            duration: 'Temps estime en attente',
            price: formatPrice(ride),
          },
        ]
      : [],
  }
}

function SearchResultsPage() {
  const data = Route.useLoaderData()
  const [selectedTrip, setSelectedTrip] = useState<TripDetails | null>(null)
  const hasBackendResult = Boolean(data.ride && data.match)
  const hasAnyResult = data.rideshare.length > 0 || data.vtc.length > 0

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Trajets proposes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {hasBackendResult
                ? 'Resultats recuperes depuis le back-end DDDriveByeBye.'
                : 'Mode demo: chauffeurs VTC disponibles avec attente, temps de trajet et prix.'}
            </p>
            {data.match ? (
              <div className="mt-3 rounded-lg border bg-background p-3 text-sm">
                <p className="font-medium">Matching {data.match.kind.toLocaleLowerCase('fr-FR')}</p>
                <p className="text-muted-foreground">
                  Statut: {data.match.status} - tentative {data.match.attemptCount}/{data.match.maxAttempts}
                </p>
                {data.match.failureReason ? (
                  <p className="text-muted-foreground">Raison: {data.match.failureReason}</p>
                ) : null}
              </div>
            ) : null}
            {data.errorMessage ? (
              <StatusState
                tone="error"
                title="Resultats indisponibles"
                description="Le back n'a pas pu retourner cette recherche. Tu peux relancer depuis l'ecran de recherche ou reessayer dans quelques secondes."
                actionLabel="Reessayer"
                onAction={() => window.location.reload()}
                className="mt-4"
              />
            ) : null}
          </CardContent>
        </Card>

        {!data.errorMessage && !hasAnyResult ? (
          <StatusState
            title="Aucun trajet trouve"
            description="Aucun chauffeur ni covoiturage ne correspond aux criteres pour le moment. Essaie une zone plus large ou relance un matching."
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Covoiturage (particuliers)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.rideshare.length > 0 ? (
              data.rideshare.map((trip) => (
                <article key={trip.id} className="rounded-lg border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary" className="inline-flex items-center gap-1">
                      <CarFront className="h-3.5 w-3.5" />
                      Particulier
                    </Badge>
                    <span className="text-xs text-muted-foreground">{trip.rating.toFixed(1)}/5</span>
                  </div>
                  <p className="text-sm font-medium">
                    {trip.from} {'->'} {trip.to}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Conducteur: {trip.driverName}</p>
                  <p className="text-xs text-muted-foreground">
                    Depart dans {trip.departureIn} - {trip.seatsLeft} place(s) restante(s)
                  </p>
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    onClick={() => setSelectedTrip({ kind: 'rideshare', trip })}
                  >
                    Voir le detail
                  </Button>
                </article>
              ))
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">VTC professionnels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.vtc.length > 0 ? (
              data.vtc.map((trip) => (
                <article key={trip.id} className="rounded-lg border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      VTC Pro
                    </Badge>
                    <span className="text-xs text-muted-foreground">{trip.company}</span>
                  </div>
                  <p className="text-sm font-medium">
                    {trip.from} {'->'} {trip.to}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Vehicule: {trip.vehicle}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Attente: {trip.waitTime}
                      </span>
                      <span>Trajet: {trip.duration}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Coins className="h-4 w-4" />
                      {trip.price}
                    </span>
                  </div>
                  <Button className="mt-3 w-full" onClick={() => setSelectedTrip({ kind: 'vtc', trip })}>
                    Voir le detail
                  </Button>
                </article>
              ))
            ) : null}
          </CardContent>
        </Card>
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
  return (
    <Drawer open={tripDetails !== null} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DrawerContent className="inset-x-0 bottom-0 mt-0 h-dvh max-h-dvh rounded-none border-0">
        {tripDetails ? (
          <>
            <DrawerHeader className="sticky top-0 z-10 flex-row items-center justify-between border-b bg-background text-left">
              <DrawerTitle className="text-lg">Detail du trajet</DrawerTitle>
              <DrawerClose asChild>
                <Button size="icon" variant="ghost" aria-label="Fermer">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {tripDetails.trip.from} {'->'} {tripDetails.trip.to}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {tripDetails.kind === 'rideshare' ? (
                    <>
                      <p>
                        <span className="font-medium">Type:</span> Covoiturage particulier
                      </p>
                      <p>
                        <span className="font-medium">Conducteur:</span> {tripDetails.trip.driverName}
                      </p>
                      <p>
                        <span className="font-medium">Note:</span> {tripDetails.trip.rating.toFixed(1)}/5
                      </p>
                      <p>
                        <span className="font-medium">Depart:</span> Dans {tripDetails.trip.departureIn}
                      </p>
                      <p>
                        <span className="font-medium">Places restantes:</span> {tripDetails.trip.seatsLeft}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <span className="font-medium">Type:</span> VTC professionnel
                      </p>
                      <p>
                        <span className="font-medium">Compagnie:</span> {tripDetails.trip.company}
                      </p>
                      <p>
                        <span className="font-medium">Vehicule:</span> {tripDetails.trip.vehicle}
                      </p>
                      <p>
                        <span className="font-medium">Attente:</span> {tripDetails.trip.waitTime}
                      </p>
                      <p>
                        <span className="font-medium">Temps de trajet:</span> {tripDetails.trip.duration}
                      </p>
                      <p>
                        <span className="font-medium">Prix:</span> {tripDetails.trip.price}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
