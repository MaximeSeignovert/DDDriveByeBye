export type DemoLocation = {
  label: string
  latitude: number
  longitude: number
}

export const demoLocations = [
  { label: 'Grenoble Gare', latitude: 45.1915, longitude: 5.7145 },
  { label: "Grenoble Presqu'ile", latitude: 45.2003, longitude: 5.7043 },
  { label: 'Grenoble Centre', latitude: 45.1885, longitude: 5.7245 },
  { label: 'Meylan Inovallee', latitude: 45.2097, longitude: 5.7797 },
  { label: "Saint-Martin-d'Heres Campus", latitude: 45.1921, longitude: 5.7718 },
] satisfies DemoLocation[]

export function resolveDemoLocation(label: string, fallback: DemoLocation) {
  const normalizedLabel = label.trim().toLocaleLowerCase('fr-FR')

  return (
    demoLocations.find((location) => location.label.toLocaleLowerCase('fr-FR') === normalizedLabel) ??
    fallback
  )
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

