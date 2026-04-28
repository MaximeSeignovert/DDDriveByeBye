import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Car, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/user/parametre')({
  component: UserParametrePage,
})

function UserParametrePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return pathname === '/user/parametre' ? <UserParametreHome /> : <Outlet />
}

function UserParametreHome() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Parametres User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Choisis la sous-page de parametres que tu veux modifier.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/user/parametre/vehicule">
              <Car className="mr-2 h-4 w-4" />
              Parametres vehicule
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/user/parametre/zone-activite">
              <MapPin className="mr-2 h-4 w-4" />
              Parametres zone d'activite
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/user/parametre/tranches-horaires">
              <Clock className="mr-2 h-4 w-4" />
              Parametres tranches horaires
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
