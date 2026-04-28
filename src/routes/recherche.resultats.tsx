import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CarFront, Clock3, Coins, ShieldCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

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
  price: string
}

type SearchResultsData = {
  rideshare: RideshareTrip[]
  vtc: VtcTrip[]
}

type TripDetails =
  | { kind: 'rideshare'; trip: RideshareTrip }
  | { kind: 'vtc'; trip: VtcTrip }

export const Route = createFileRoute('/recherche/resultats')({
  loader: async () => {
    const response = await fetch('/mocks/search-results-page.json')
    return (await response.json()) as SearchResultsData
  },
  component: SearchResultsPage,
})

function SearchResultsPage() {
  const data = Route.useLoaderData()
  const [selectedTrip, setSelectedTrip] = useState<TripDetails | null>(null)

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Trajets proposes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Compare les offres de covoiturage particulier et les trajets VTC professionnels.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Covoiturage (particuliers)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.rideshare.map((trip) => (
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">VTC professionnels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.vtc.map((trip) => (
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
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Attente: {trip.waitTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Coins className="h-4 w-4" />
                    {trip.price}
                  </span>
                </div>
                <Button className="mt-3 w-full" onClick={() => setSelectedTrip({ kind: 'vtc', trip })}>
                  Voir le detail
                </Button>
              </article>
            ))}
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
