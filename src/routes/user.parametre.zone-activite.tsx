import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type UserData = {
  activityZone?: string[]
}

export const Route = createFileRoute('/user/parametre/zone-activite')({
  loader: async () => {
    const response = await fetch('/mocks/user-page.json')
    return (await response.json()) as UserData
  },
  component: ActivityZoneParametrePage,
})

function ActivityZoneParametrePage() {
  const data = Route.useLoaderData()
  const [activityZones, setActivityZones] = useState(data.activityZone ?? [])
  const [newZone, setNewZone] = useState('')

  const addZone = () => {
    if (!newZone.trim()) return
    setActivityZones((prev) => [...prev, newZone.trim()])
    setNewZone('')
  }

  const updateZone = (index: number, value: string) => {
    setActivityZones((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const deleteZone = (index: number) => {
    setActivityZones((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" className="px-2">
        <Link to="/user">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour profil
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Parametres zone d'activite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activityZones.length > 0 ? (
            <div className="space-y-2">
              {activityZones.map((zone, index) => (
                <div key={`${zone}-${index}`} className="flex items-center gap-2">
                  <Input value={zone} onChange={(event) => updateZone(index, event.target.value)} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => deleteZone(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune zone renseignee.</p>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Ajouter une zone d'activite"
              value={newZone}
              onChange={(event) => setNewZone(event.target.value)}
            />
            <Button type="button" onClick={addZone}>
              Ajouter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activityZones.map((zone) => (
              <Badge key={`badge-${zone}`} variant="secondary">
                {zone}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
