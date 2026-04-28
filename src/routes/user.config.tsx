import { createFileRoute, Link } from '@tanstack/react-router'
import { Car, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/user/config')({
  component: UserConfigPage,
})

function UserConfigPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Configuration User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Choisis la sous-page que tu veux modifier.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/user/config/vehicule">
              <Car className="mr-2 h-4 w-4" />
              Configuration vehicule
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/user/config/zone-activite">
              <MapPin className="mr-2 h-4 w-4" />
              Configuration zone d'activite
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/user/config/tranches-horaires">
              <Clock className="mr-2 h-4 w-4" />
              Configuration tranches horaires
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
