import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarDays, CarFront, Clock3, MapPin, Navigation, UserRound, Users, WalletCards, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
}

type TripDetails = {
  section: 'ongoing' | 'planned'
  trip: Trip
}

export const Route = createFileRoute('/trajets')({
  loader: async () => {
    const response = await fetch('/mocks/trips-page.json')
    return (await response.json()) as TripsData
  },
  component: TripsPage,
})

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

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Page de Trajets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Suivi des trajets en cours et des trajets prevus.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="ongoing" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ongoing">Trajets en cours</TabsTrigger>
                <TabsTrigger value="planned">Trajets planifies</TabsTrigger>
              </TabsList>

              <TabsContent value="ongoing" className="mt-4 space-y-2">
                {data.ongoing.map((trip) => (
                  <TripCard
                    key={trip.id}
                    section="ongoing"
                    trip={trip}
                    onSelect={() => setSelectedTrip({ section: 'ongoing', trip })}
                  />
                ))}
              </TabsContent>

              <TabsContent value="planned" className="mt-4 space-y-2">
                {data.planned.map((trip, index) => {
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
                })}
              </TabsContent>
            </Tabs>
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
