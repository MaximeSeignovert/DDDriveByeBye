import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Power, Trash2 } from 'lucide-react'
import { StatusState } from '@/components/status-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { activateDriverAvailability, deactivateDriverAvailability, getDriverProfile } from '@/lib/api'
import { ensureDriverId, getStoredDriverId } from '@/lib/demo-session'

type UserData = {
  availability?: Array<{ start: string; end: string }>
  isAvailable?: boolean
  errorMessage?: string
}

type AvailabilityTimeField = 'start' | 'end'

export const Route = createFileRoute('/user/parametre/tranches-horaires')({
  loader: async () => {
    const driverId = getStoredDriverId()

    if (driverId) {
      try {
        const driverProfile = await getDriverProfile(driverId)

        return {
          availability: [{ start: '07:00', end: '21:00' }],
          isAvailable: driverProfile.availabilityStatus === 'AVAILABLE',
        } satisfies UserData
      } catch (error) {
        return {
          availability: [],
          isAvailable: false,
          errorMessage: error instanceof Error ? error.message : 'Impossible de charger la disponibilite.',
        } satisfies UserData
      }
    }

    const response = await fetch('/mocks/user-page.json')
    return (await response.json()) as UserData
  },
  component: AvailabilityParametrePage,
})

function AvailabilityParametrePage() {
  const data = Route.useLoaderData()
  const [availability, setAvailability] = useState(data.availability ?? [])
  const [newAvailability, setNewAvailability] = useState({ start: '', end: '' })
  const [isAvailable, setIsAvailable] = useState(data.isAvailable ?? false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

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

  const toggleBackAvailability = async () => {
    setIsSyncing(true)
    setStatusMessage(null)

    try {
      const driverId = await ensureDriverId()

      if (isAvailable) {
        await deactivateDriverAvailability(driverId)
        setIsAvailable(false)
        setStatusMessage('Disponibilite desactivee cote back.')
      } else {
        await activateDriverAvailability(driverId)
        setIsAvailable(true)
        setStatusMessage('Disponibilite activee cote back.')
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Impossible de mettre a jour la disponibilite.')
    } finally {
      setIsSyncing(false)
    }
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
          {data.errorMessage ? (
            <StatusState
              tone="offline"
              title="Disponibilite non chargee"
              description="Le statut chauffeur n'est pas disponible. Tu peux reessayer l'activation quand le back repond."
            />
          ) : null}
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
            <div>
              <p className="text-sm font-medium">Disponibilite back</p>
              <p className="text-sm text-muted-foreground">
                {isAvailable ? 'Chauffeur disponible.' : 'Chauffeur hors ligne.'}
              </p>
            </div>
            <Button type="button" variant={isAvailable ? 'outline' : 'default'} onClick={toggleBackAvailability} disabled={isSyncing}>
              <Power className="mr-1 h-3.5 w-3.5" />
              {isSyncing ? 'Envoi...' : isAvailable ? 'Desactiver' : 'Activer'}
            </Button>
          </div>
          {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}

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
            <StatusState
              title="Aucune tranche horaire"
              description="Ajoute une premiere plage pour visualiser tes horaires de conduite dans l'application."
            />
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
