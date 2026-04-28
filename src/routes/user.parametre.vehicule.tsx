import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UserData = {
  vehicles?: Array<{ brand: string; model: string; plate: string; seats: number }>
}

export const Route = createFileRoute('/user/parametre/vehicule')({
  loader: async () => {
    const response = await fetch('/mocks/user-page.json')
    return (await response.json()) as UserData
  },
  component: VehicleParametrePage,
})

function VehicleParametrePage() {
  const data = Route.useLoaderData()
  const [vehicles, setVehicles] = useState(data.vehicles ?? [])
  const [vehicleForm, setVehicleForm] = useState({ brand: '', model: '', plate: '', seats: 4 })
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null)

  const resetVehicleForm = () => {
    setVehicleForm({ brand: '', model: '', plate: '', seats: 4 })
    setEditingVehicleIndex(null)
  }

  const submitVehicle = () => {
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.plate) return
    if (editingVehicleIndex !== null) {
      setVehicles((prev) =>
        prev.map((item, index) => (index === editingVehicleIndex ? vehicleForm : item)),
      )
      resetVehicleForm()
      return
    }
    setVehicles((prev) => [...prev, vehicleForm])
    resetVehicleForm()
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
        <CardContent className="space-y-3">
          {vehicles.length > 0 ? (
            <div className="space-y-2">
              {vehicles.map((vehicle, index) => (
                <div key={`${vehicle.plate}-${index}`} className="rounded-lg border bg-background p-3 text-sm">
                  <p className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-muted-foreground">
                    {vehicle.plate} - {vehicle.seats} places
                  </p>
                  <div className="mt-2 flex gap-2">
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
            <p className="text-sm text-muted-foreground">Aucun vehicule renseigne.</p>
          )}

          <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <p className="text-sm font-medium">
              {editingVehicleIndex !== null ? 'Modifier le vehicule' : 'Ajouter un vehicule'}
            </p>
            <div className="grid grid-cols-2 gap-2">
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
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={submitVehicle}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                {editingVehicleIndex !== null ? 'Mettre a jour' : 'Ajouter'}
              </Button>
              {editingVehicleIndex !== null ? (
                <Button type="button" variant="outline" onClick={resetVehicleForm}>
                  Annuler
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
