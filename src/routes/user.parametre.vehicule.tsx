import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { StatusState } from '@/components/status-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addVehicle, getDriverProfile, type FuelType, type VehicleDto } from '@/lib/api'
import { ensureDriverId, getStoredDriverId } from '@/lib/demo-session'

type UserData = {
  vehicles?: VehicleForm[]
  errorMessage?: string
}

type VehicleForm = {
  id?: string
  brand: string
  model: string
  plate: string
  seats: number
  year: number
  fuelType: FuelType
}

function toVehicleForm(vehicle: VehicleDto): VehicleForm {
  return {
    id: vehicle.id,
    brand: vehicle.make,
    model: vehicle.model,
    plate: vehicle.licensePlate,
    seats: vehicle.seats,
    year: vehicle.year,
    fuelType: vehicle.fuelType,
  }
}

export const Route = createFileRoute('/user/parametre/vehicule')({
  loader: async () => {
    const driverId = getStoredDriverId()

    if (driverId) {
      try {
        const driverProfile = await getDriverProfile(driverId)
        return { vehicles: driverProfile.vehicles.map(toVehicleForm) } satisfies UserData
      } catch (error) {
        return {
          vehicles: [],
          errorMessage: error instanceof Error ? error.message : 'Impossible de charger les vehicules.',
        } satisfies UserData
      }
    }

    const response = await fetch('/mocks/user-page.json')
    const data = (await response.json()) as { vehicles?: Array<{ brand: string; model: string; plate: string; seats: number }> }

    return {
      vehicles: data.vehicles?.map((vehicle) => ({
        ...vehicle,
        year: 2022,
        fuelType: 'HYBRID',
      })),
    } satisfies UserData
  },
  component: VehicleParametrePage,
})

function VehicleParametrePage() {
  const data = Route.useLoaderData()
  const [vehicles, setVehicles] = useState(data.vehicles ?? [])
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>({
    brand: '',
    model: '',
    plate: '',
    seats: 4,
    year: 2022,
    fuelType: 'HYBRID',
  })
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetVehicleForm = () => {
    setVehicleForm({ brand: '', model: '', plate: '', seats: 4, year: 2022, fuelType: 'HYBRID' })
    setEditingVehicleIndex(null)
  }

  const submitVehicle = async () => {
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.plate) return
    setIsSubmitting(true)
    setStatusMessage(null)

    if (editingVehicleIndex !== null) {
      setVehicles((prev) =>
        prev.map((item, index) => (index === editingVehicleIndex ? vehicleForm : item)),
      )
      resetVehicleForm()
      setStatusMessage('Modification locale uniquement: le back expose seulement l’ajout de vehicule.')
      setIsSubmitting(false)
      return
    }

    try {
      const driverId = await ensureDriverId()
      const vehicleId = await addVehicle(driverId, {
        make: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year,
        licensePlate: vehicleForm.plate,
        seats: vehicleForm.seats,
        fuelType: vehicleForm.fuelType,
        options: ['AIR_CONDITIONING'],
      })

      setVehicles((prev) => [...prev, { ...vehicleForm, id: vehicleId ?? undefined }])
      resetVehicleForm()
      setStatusMessage('Vehicule ajoute via le back.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Impossible d’ajouter le vehicule.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditVehicle = (index: number) => {
    setVehicleForm(vehicles[index])
    setEditingVehicleIndex(index)
  }

  const deleteVehicle = (index: number) => {
    setVehicles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    if (editingVehicleIndex === index) resetVehicleForm()
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
          <CardTitle className="text-xl">Parametres vehicule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {vehicles.length > 0 ? (
            <div className="divide-y">
              {vehicles.map((vehicle, index) => (
                <div
                  key={`${vehicle.plate}-${index}`}
                  className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-muted-foreground">
                      {vehicle.plate} - {vehicle.seats} places - {vehicle.fuelType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => startEditVehicle(index)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => deleteVehicle(index)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StatusState
              tone={data.errorMessage ? 'offline' : 'empty'}
              title={data.errorMessage ? 'Vehicules indisponibles' : 'Aucun vehicule renseigne'}
              description={
                data.errorMessage
                  ? "Le back n'a pas retourne la liste des vehicules. Tu peux tout de meme tenter un nouvel ajout."
                  : 'Ajoute ton premier vehicule pour pouvoir recevoir ou proposer des trajets.'
              }
            />
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">
              {editingVehicleIndex !== null ? 'Modifier le vehicule' : 'Ajouter un vehicule'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Marque</Label>
                <Input
                  value={vehicleForm.brand}
                  onChange={(event) => setVehicleForm((prev) => ({ ...prev, brand: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Modele</Label>
                <Input
                  value={vehicleForm.model}
                  onChange={(event) => setVehicleForm((prev) => ({ ...prev, model: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Plaque</Label>
                <Input
                  value={vehicleForm.plate}
                  onChange={(event) => setVehicleForm((prev) => ({ ...prev, plate: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Places</Label>
                <Input
                  type="number"
                  min={1}
                  max={9}
                  value={vehicleForm.seats}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, seats: Number(event.target.value) || 1 }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Annee</Label>
                <Input
                  type="number"
                  min={1990}
                  max={2035}
                  value={vehicleForm.year}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, year: Number(event.target.value) || 2022 }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Carburant</Label>
                <select
                  value={vehicleForm.fuelType}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, fuelType: event.target.value as FuelType }))
                  }
                >
                  <option value="GASOLINE">Essence</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybride</option>
                  <option value="ELECTRIC">Electrique</option>
                  <option value="LPG">GPL</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={submitVehicle} disabled={isSubmitting}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                {isSubmitting ? 'Envoi...' : editingVehicleIndex !== null ? 'Mettre a jour' : 'Ajouter'}
              </Button>
              {editingVehicleIndex !== null ? (
                <Button type="button" variant="outline" onClick={resetVehicleForm}>
                  Annuler
                </Button>
              ) : null}
            </div>
            {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
