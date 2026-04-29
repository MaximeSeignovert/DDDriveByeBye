import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UserData = {
  availability?: Array<{ start: string; end: string }>
}

type AvailabilityTimeField = 'start' | 'end'

export const Route = createFileRoute('/user/parametre/tranches-horaires')({
  loader: async () => {
    const response = await fetch('/mocks/user-page.json')
    return (await response.json()) as UserData
  },
  component: AvailabilityParametrePage,
})

function AvailabilityParametrePage() {
  const data = Route.useLoaderData()
  const [availability, setAvailability] = useState(data.availability ?? [])
  const [newAvailability, setNewAvailability] = useState({ start: '', end: '' })

  const addAvailability = () => {
    if (!newAvailability.start || !newAvailability.end) return
    setAvailability((prev) => [...prev, newAvailability])
    setNewAvailability({ start: '', end: '' })
  }

  const updateAvailabilityTime = (index: number, field: AvailabilityTimeField, value: string) => {
    setAvailability((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    )
  }

  const deleteAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
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
          <CardTitle className="text-xl">Parametres tranches horaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availability.length > 0 ? (
            <div className="divide-y text-sm">
              {availability.map((item, index) => (
                <div
                  key={`${item.start}-${item.end}-${index}`}
                  className="grid gap-3 py-3 first:pt-0 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <div className="space-y-1">
                    <Label>Debut</Label>
                    <Input
                      type="time"
                      value={item.start}
                      onChange={(event) => updateAvailabilityTime(index, 'start', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fin</Label>
                    <Input
                      type="time"
                      value={item.end}
                      onChange={(event) => updateAvailabilityTime(index, 'end', event.target.value)}
                    />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => deleteAvailability(index)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune disponibilite renseignee.</p>
          )}

          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium">Ajouter une disponibilite</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="availability-start">Debut</Label>
                <Input
                  id="availability-start"
                  type="time"
                  value={newAvailability.start}
                  onChange={(event) =>
                    setNewAvailability((prev) => ({
                      ...prev,
                      start: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="availability-end">Fin</Label>
                <Input
                  id="availability-end"
                  type="time"
                  value={newAvailability.end}
                  onChange={(event) =>
                    setNewAvailability((prev) => ({
                      ...prev,
                      end: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button type="button" onClick={addAvailability}>
              Ajouter la tranche
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
