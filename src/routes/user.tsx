import { useState } from 'react'
import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Star, Car, MapPin, Clock, Settings } from 'lucide-react'
import { StatusState } from '@/components/status-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { getDriverProfile, getUser, type DriverProfileDto, type UserDto } from '@/lib/api'
import { ensureDriverId, getStoredDriverId, getStoredPassengerId } from '@/lib/demo-session'
import { getUserMode, setUserMode, useUserMode } from '@/lib/user-mode'

type UserData = {
  firstName: string
  lastName: string
  rating: number
  user?: UserDto
  driverProfile?: DriverProfileDto | null
  errorMessage?: string
}

const parameterLinks = [
  {
    to: '/user/parametre',
    label: 'Parametres generaux',
    description: 'Choisir le theme clair ou sombre de l’application.',
    icon: Settings,
  },
  {
    to: '/user/parametre/vehicule',
    label: 'Parametres vehicule',
    description: 'Ajouter, modifier ou supprimer tes vehicules.',
    icon: Car,
  },
  {
    to: '/user/parametre/zone-activite',
    label: "Parametres zone d'activite",
    description: 'Definir les zones ou tu acceptes des trajets.',
    icon: MapPin,
  },
  {
    to: '/user/parametre/tranches-horaires',
    label: 'Parametres tranches horaires',
    description: 'Configurer tes disponibilites de conduite.',
    icon: Clock,
  },
] as const

export const Route = createFileRoute('/user')({
  loader: async () => {
    const userId = getStoredDriverId() ?? getStoredPassengerId()

    if (userId) {
      try {
        const user = await getUser(userId)
        const driverProfile =
          user.accountType === 'PROFESSIONAL'
            ? await getDriverProfile(userId).catch(() => null)
            : null
        const [firstName = user.fullName, ...lastNameParts] = user.fullName.split(' ')

        return {
          firstName,
          lastName: lastNameParts.join(' '),
          rating: 4.6,
          user,
          driverProfile,
        } satisfies UserData
      } catch (error) {
        const response = await fetch('/mocks/user-page.json')
        const data = (await response.json()) as UserData

        return {
          ...data,
          errorMessage: error instanceof Error ? error.message : 'Impossible de charger le profil.',
        } satisfies UserData
      }
    }

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
  const userMode = useUserMode()
  const [professionalModeError, setProfessionalModeError] = useState<string | null>(null)
  const fullName = `${data.firstName} ${data.lastName}`
  const isProfessional = userMode === 'professionnel'
  const driverProfile = data.driverProfile

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profil User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Nom prenom</p>
          <p className="text-lg font-semibold">{fullName}</p>
          {data.user ? (
            <p className="text-sm text-muted-foreground">
              {data.user.email} - {data.user.accountType} - {data.user.status}
            </p>
          ) : null}
          {driverProfile ? (
            <p className="text-sm text-muted-foreground">
              Profil chauffeur: {driverProfile.status} - disponibilite {driverProfile.availabilityStatus}
            </p>
          ) : null}
          {data.errorMessage ? (
            <StatusState
              tone="offline"
              title="Profil local affiche"
              description="Le profil back n'est pas disponible pour le moment. Les informations de secours restent affichees pour continuer a naviguer."
              className="mt-4"
            />
          ) : null}
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
          <Separator />
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
            <div className="space-y-1">
              <Label htmlFor="professional-mode" className="text-sm font-medium">
                Mode professionnel
              </Label>
              <p className="text-sm text-muted-foreground">
                {isProfessional ? 'Courses disponibles activees.' : 'Mode particulier active.'}
              </p>
            </div>
            <Switch
              id="professional-mode"
              checked={isProfessional}
              onCheckedChange={async (checked) => {
                setProfessionalModeError(null)
                setUserMode(checked ? 'professionnel' : 'particulier')

                if (checked) {
                  try {
                    await ensureDriverId()
                  } catch (error) {
                    if (getUserMode() === 'professionnel') {
                      setProfessionalModeError(
                        error instanceof Error
                          ? error.message
                          : "Mode professionnel active localement, mais le profil chauffeur n'a pas pu etre synchronise.",
                      )
                    }
                  }
                }
              }}
            />
          </div>
          {professionalModeError ? (
            <StatusState
              tone="offline"
              title="Mode professionnel active localement"
              description="Tu peux acceder aux courses en mode demo. La creation du profil chauffeur sera retentee depuis l'ecran Courses quand le back sera disponible."
            />
          ) : null}
        </CardContent>
      </Card>

      {parameterLinks.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.to} to={item.to} className="block">
            <Card className="transition hover:border-foreground/30 hover:shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
