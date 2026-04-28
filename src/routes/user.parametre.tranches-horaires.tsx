import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UserData = {
  availability?: Array<{ day: string; slots: string[] }>
}

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
  const [newAvailability, setNewAvailability] = useState({ day: '', slots: '' })

  const addAvailability = () => {
    if (!newAvailability.day.trim() || !newAvailability.slots.trim()) return
    const parsedSlots = newAvailability.slots
      .split(',')
      .map((slot) => slot.trim())
      .filter(Boolean)
    if (parsedSlots.length === 0) return
    setAvailability((prev) => [...prev, { day: newAvailability.day.trim(), slots: parsedSlots }])
    setNewAvailability({ day: '', slots: '' })
  }

  const updateAvailabilityDay = (index: number, value: string) => {
    setAvailability((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, day: value } : item)),
    )
  }

  const updateAvailabilitySlots = (index: number, value: string) => {
    const parsedSlots = value
      .split(',')
      .map((slot) => slot.trim())
      .filter(Boolean)
    setAvailability((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, slots: parsedSlots } : item)),
    )
  }

  const deleteAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" className="px-2">
        <Link to="/user/parametre">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour parametres
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Parametres tranches horaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availability.length > 0 ? (
            <div className="space-y-2 text-sm">
              {availability.map((item, index) => (
                <div key={`${item.day}-${index}`} className="rounded-lg border bg-background p-3 space-y-2">
                  <div className="space-y-1">
                    <Label>Jour</Label>
                    <Input value={item.day} onChange={(event) => updateAvailabilityDay(index, event.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Tranches (separees par des virgules)</Label>
                    <Input
                      value={item.slots.join(', ')}
                      onChange={(event) => updateAvailabilitySlots(index, event.target.value)}
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

          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <p className="text-sm font-medium">Ajouter une disponibilite</p>
            <div className="space-y-1">
              <Label htmlFor="availability-day">Jour</Label>
              <Input
                id="availability-day"
                placeholder="Ex: Lundi-Vendredi"
                value={newAvailability.day}
                onChange={(event) =>
                  setNewAvailability((prev) => ({
                    ...prev,
                    day: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="availability-slots">Tranches horaires</Label>
              <Input
                id="availability-slots"
                placeholder="Ex: 08:00-10:00, 18:00-20:00"
                value={newAvailability.slots}
                onChange={(event) =>
                  setNewAvailability((prev) => ({
                    ...prev,
                    slots: event.target.value,
                  }))
                }
              />
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
