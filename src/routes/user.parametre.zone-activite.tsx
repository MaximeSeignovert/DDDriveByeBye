import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { StatusState } from '@/components/status-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDriverProfile, setActivityZone, setWorkingZone } from '@/lib/api'
import { demoLocations, resolveDemoLocation } from '@/lib/demo-locations'
import { ensureDriverId, getStoredDriverId } from '@/lib/demo-session'

type UserData = {
  activityZone?: string[]
  workingZoneLabel?: string | null
  errorMessage?: string
}

export const Route = createFileRoute('/user/parametre/zone-activite')({
  loader: async () => {
    const driverId = getStoredDriverId()

    if (driverId) {
      try {
        const driverProfile = await getDriverProfile(driverId)

        return {
          activityZone: driverProfile.activityZoneLabel ? [driverProfile.activityZoneLabel] : [],
          workingZoneLabel: driverProfile.workingZoneLabel,
        } satisfies UserData
      } catch (error) {
        return {
          activityZone: [],
          workingZoneLabel: null,
          errorMessage: error instanceof Error ? error.message : 'Impossible de charger les zones.',
        } satisfies UserData
      }
    }

    const response = await fetch('/mocks/user-page.json')
    return (await response.json()) as UserData
  },
  component: ActivityZoneParametrePage,
})

function ActivityZoneParametrePage() {
  const data = Route.useLoaderData()
  const [activityZones, setActivityZones] = useState(data.activityZone ?? [])
  const [newZone, setNewZone] = useState(data.activityZone?.[0] ?? demoLocations[0].label)
  const [workingZone, setWorkingZoneLabel] = useState(data.workingZoneLabel ?? demoLocations[3].label)
  const [radiusKm, setRadiusKm] = useState(12)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const addZone = () => {
    if (!newZone.trim()) return
    setActivityZones((prev) => [...prev, newZone.trim()])
    setNewZone('')
  }

  const saveZones = async () => {
    setIsSaving(true)
    setStatusMessage(null)

    try {
      const driverId = await ensureDriverId()
      const activity = resolveDemoLocation(activityZones[0] ?? newZone, demoLocations[0])
      const working = resolveDemoLocation(workingZone, demoLocations[3])

      await setWorkingZone(driverId, {
        label: workingZone,
        latitude: working.latitude,
        longitude: working.longitude,
        radiusKm: Math.max(radiusKm, 25),
      })
      await setActivityZone(driverId, {
        label: activityZones[0] ?? activity.label,
        latitude: activity.latitude,
        longitude: activity.longitude,
        radiusKm,
      })
      setStatusMessage('Zones synchronisees avec le back.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Impossible de synchroniser les zones.')
    } finally {
      setIsSaving(false)
    }
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
        <CardContent className="space-y-4">
          {data.errorMessage ? (
            <StatusState
              tone="offline"
              title="Zones non chargees"
              description="Le back n'a pas retourne tes zones actuelles. Les champs restent disponibles pour resynchroniser une zone propre."
            />
          ) : null}
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
            <StatusState
              title="Aucune zone d'activite"
              description="Ajoute une zone autour de Grenoble pour indiquer ou tu acceptes les trajets."
            />
          )}

          <div className="flex items-center gap-2 pt-1">
            <Input
              placeholder="Ajouter une zone d'activite"
              list="demo-locations"
              value={newZone}
              onChange={(event) => setNewZone(event.target.value)}
            />
            <Button type="button" onClick={addZone}>
              Ajouter
            </Button>
          </div>
          <datalist id="demo-locations">
            {demoLocations.map((location) => (
              <option key={location.label} value={location.label} />
            ))}
          </datalist>
          <div className="grid gap-3 rounded-lg border bg-background p-3">
            <div className="space-y-1">
              <Label htmlFor="working-zone">Zone de travail</Label>
              <Input
                id="working-zone"
                list="demo-locations"
                value={workingZone}
                onChange={(event) => setWorkingZoneLabel(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="radius-km">Rayon d'activite en km</Label>
              <Input
                id="radius-km"
                type="number"
                min={1}
                value={radiusKm}
                onChange={(event) => setRadiusKm(Number(event.target.value) || 1)}
              />
            </div>
            <Button type="button" onClick={saveZones} disabled={isSaving}>
              <Save className="mr-1 h-3.5 w-3.5" />
              {isSaving ? 'Synchronisation...' : 'Synchroniser avec le back'}
            </Button>
            {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
