import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Star, Car, MapPin, Clock, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

type UserData = {
  firstName: string
  lastName: string
  rating: number
  vehicles?: Array<{ brand: string; model: string; plate: string; seats: number }>
  activityZone?: string[]
  availability?: Array<{ day: string; slots: string[] }>
}

export const Route = createFileRoute('/user')({
  loader: async () => {
    const response = await fetch('/mocks/user-page.json')
    return (await response.json()) as UserData
  },
  component: UserPage,
})

function UserPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return pathname === '/user' ? <UserProfile /> : <Outlet />
}

function UserProfile() {
  const data = Route.useLoaderData()
  const fullName = `${data.firstName} ${data.lastName}`

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profil User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Nom prenom</p>
          <p className="text-lg font-semibold">{fullName}</p>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Notations</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`star-${index}`}
                  className={`h-5 w-5 ${
                    index < Math.round(data.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/40'
                  }`}
                />
              ))}
              <span className="text-sm font-medium">{data.rating.toFixed(1)}/5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Car className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Infos Vehicules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.vehicles && data.vehicles.length > 0 ? (
            <div className="space-y-2">
              {data.vehicles.map((vehicle) => (
                <div
                  key={`${vehicle.plate}-${vehicle.model}`}
                  className="rounded-lg border bg-background p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-muted-foreground">
                      {vehicle.plate} - {vehicle.seats} places
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Non renseigne</p>
          )}
          <Button asChild className="w-full">
            <Link to="/user/parametre/vehicule">
              <Settings className="mr-2 h-4 w-4" />
              Configurer les vehicules
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Activity Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.activityZone && data.activityZone.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.activityZone.map((zone) => (
                <Badge key={zone} variant="secondary">
                  {zone}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Non renseigne</p>
          )}
          <Button asChild className="w-full">
            <Link to="/user/parametre/zone-activite">
              <Settings className="mr-2 h-4 w-4" />
              Configurer la zone d'activite
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.availability && data.availability.length > 0 ? (
            <div className="space-y-2 text-sm">
              {data.availability.map((item) => (
                <div key={item.day} className="rounded-lg border bg-background p-3 space-y-1">
                  <p className="font-medium">{item.day}</p>
                  <p className="text-muted-foreground">{item.slots.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Non renseigne</p>
          )}
          <Button asChild className="w-full">
            <Link to="/user/parametre/tranches-horaires">
              <Settings className="mr-2 h-4 w-4" />
              Configurer les tranches horaires
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
