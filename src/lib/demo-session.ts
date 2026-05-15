import {
  activateDriverAvailability,
  approveDriverProfile,
  createIndividualUser,
  createProfessionalUser,
  type MatchKind,
  setActivityZone,
  setWorkingZone,
  updateDriverPosition,
} from '@/lib/api'
import { demoLocations } from '@/lib/demo-locations'

const passengerIdStorageKey = 'dddrive-passenger-id'
const driverIdStorageKey = 'dddrive-driver-id'
const lastRideIdStorageKey = 'dddrive-last-ride-id'
const lastRideStorageKey = 'dddrive-last-ride'

export type StoredRide = {
  rideId: string
  kind: MatchKind
  plannedAt?: string
  departureLabel?: string
  destinationLabel?: string
  pickupLat?: number
  pickupLon?: number
  destLat?: number
  destLon?: number
  createdAt?: string
}

export async function ensurePassengerId() {
  const storedPassengerId = window.localStorage.getItem(passengerIdStorageKey)

  if (storedPassengerId) {
    return storedPassengerId
  }

  const passengerId = await createIndividualUser()
  window.localStorage.setItem(passengerIdStorageKey, passengerId)
  return passengerId
}

export function getStoredPassengerId() {
  return window.localStorage.getItem(passengerIdStorageKey)
}

export function getStoredDriverId() {
  return window.localStorage.getItem(driverIdStorageKey)
}

export function getStoredLastRideId() {
  return getStoredLastRide()?.rideId ?? window.localStorage.getItem(lastRideIdStorageKey)
}

export function getStoredLastRide() {
  const storedRide = window.localStorage.getItem(lastRideStorageKey)

  if (!storedRide) {
    return null
  }

  try {
    return JSON.parse(storedRide) as StoredRide
  } catch {
    return null
  }
}

export function storeLastRide(ride: StoredRide) {
  window.localStorage.setItem(lastRideStorageKey, JSON.stringify(ride))
  window.localStorage.setItem(lastRideIdStorageKey, ride.rideId)
}

export function storeLastRideId(rideId: string) {
  window.localStorage.setItem(lastRideIdStorageKey, rideId)
  storeLastRide({ rideId, kind: 'immediate' })
}

export function createDemoRideId(kind: MatchKind) {
  return `demo-${kind}-${Date.now()}`
}

export async function ensureDriverId() {
  const storedDriverId = window.localStorage.getItem(driverIdStorageKey)

  if (storedDriverId) {
    return storedDriverId
  }

  const driverId = await createProfessionalUser()
  const [activityZone, workingZone] = [demoLocations[0], demoLocations[3]]

  await approveDriverProfile(driverId)
  await setWorkingZone(driverId, {
    label: workingZone.label,
    latitude: workingZone.latitude,
    longitude: workingZone.longitude,
    radiusKm: 25,
  })
  await setActivityZone(driverId, {
    label: activityZone.label,
    latitude: activityZone.latitude,
    longitude: activityZone.longitude,
    radiusKm: 10,
  })
  await activateDriverAvailability(driverId)
  await updateDriverPosition(driverId, activityZone.latitude, activityZone.longitude)

  window.localStorage.setItem(driverIdStorageKey, driverId)
  return driverId
}

