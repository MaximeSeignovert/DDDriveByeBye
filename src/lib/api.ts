export type UUID = string

export type MatchKind = 'immediate' | 'scheduled'

export type AccountType = 'INDIVIDUAL' | 'PROFESSIONAL'
export type UserStatus = 'PENDING_VALIDATION' | 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED'
export type DriverProfileStatus = 'PENDING_VALIDATION' | 'ACTIVE' | 'REJECTED'
export type AvailabilityStatus = 'OFFLINE' | 'AVAILABLE' | 'ON_RIDE'
export type FuelType = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG'
export type VehicleOption =
  | 'AIR_CONDITIONING'
  | 'CHILD_SEAT'
  | 'PET_FRIENDLY'
  | 'WHEELCHAIR_ACCESSIBLE'
  | 'OVERSIZED_LUGGAGE'

export type UserDto = {
  id: UUID
  fullName: string
  email: string
  phoneNumber: string
  accountType: AccountType
  status: UserStatus
}

export type VehicleDto = {
  id: UUID
  make: string
  model: string
  year: number
  licensePlate: string
  seats: number
  fuelType: FuelType
  options: VehicleOption[]
}

export type DriverProfileDto = {
  userId: UUID
  accountType: AccountType
  status: DriverProfileStatus
  availabilityStatus: AvailabilityStatus
  workingZoneLabel: string | null
  activityZoneLabel: string | null
  vehicles: VehicleDto[]
}

export type AvailableDriverDto = {
  driverId: UUID
  accountType: AccountType
  latitude: number
  longitude: number
}

export type RideDto = {
  id: UUID
  passengerId: UUID
  driverId: UUID | null
  state: string
  pickupLat: number
  pickupLon: number
  destLat: number
  destLon: number
  priceAmount: number
  priceCurrency: string
  requestedSeats: number
}

export type MatchDto = {
  matchId: UUID
  rideId: UUID
  kind: 'IMMEDIATE' | 'SCHEDULED'
  status: 'SEARCHING' | 'PROPOSED' | 'ACCEPTED' | 'UNMATCHED' | 'CANCELLED'
  proposedDriverId: UUID | null
  proposalExpiresAt: string | null
  acceptedDriverId: UUID | null
  attemptCount: number
  maxAttempts: number
  failureReason: string | null
  excludedDriverIds: UUID[]
}

export type CreateRideRequest = {
  passengerId: UUID
  pickupLat: number
  pickupLon: number
  destLat: number
  destLon: number
  requestedSeats: number
}

export type MatchingRequest = {
  rideId: UUID
  pickupLatitude: number
  pickupLongitude: number
  searchRadiusKm: number
  requiredOptions: string[]
  passengerHasPet: boolean
  territoryId?: UUID
  territoryRequiresVtcLicense: boolean
}

export type RideOfferSearchResultDto = {
  rideOfferId: UUID
  driverId: UUID
  originLatitude: number
  originLongitude: number
  destinationLatitude: number
  destinationLongitude: number
  departureAt: string
  seatsAvailable: number
  minutesFromPreferredTime: number
}

export type CreateProfessionalUserRequest = {
  fullName: string
  email: string
  phoneNumber: string
  vtcLicenseNumber: string
  vtcLicenseExpiry: string
  driversLicenseNumber: string
  driversLicenseExpiry: string
  insuranceCompany: string
  insurancePolicyNumber: string
  insuranceExpiry: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
}

export type AddVehicleRequest = {
  make: string
  model: string
  year: number
  licensePlate: string
  seats: number
  fuelType: FuelType
  options: VehicleOption[]
}

export type ZoneRequest = {
  label: string
  latitude: number
  longitude: number
  radiusKm: number
}

export type AddDriverProfileRequest = {
  driversLicenseNumber: string
  driversLicenseExpiry: string
  insuranceCompany: string
  insurancePolicyNumber: string
  insuranceExpiry: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
}

export type DriverPositionDto = {
  driverId: UUID
  latitude: number
  longitude: number
  capturedAt: string
}

export type NearbyDriverDto = {
  driverId: UUID
  latitude: number
  longitude: number
  distanceKm: number
}

export type RouteDto = {
  id: UUID
  originLatitude: number
  originLongitude: number
  destinationLatitude: number
  destinationLongitude: number
  distanceKm: number
  durationMinutes: number
  calculatedAt: string
}

export type TerritoryDto = {
  id: UUID
  name: string
  centerLatitude: number
  centerLongitude: number
  radiusKm: number
  active: boolean
  rule: {
    perKilometerRate: number
    perMinuteRate: number
    pickupFee: number
    maxSurgeCoefficient: number
    cancellationFee: number
    carpoolingGroupingEnabled: boolean
    fixedFare: number | null
    currency: string
  }
  constraints: Array<{ code: string; description: string }>
}

export type TerritoryRulesRequest = {
  perKilometerRate: number
  perMinuteRate: number
  pickupFee: number
  maxSurgeCoefficient: number
  cancellationFee: number
  carpoolingGroupingEnabled: boolean
  fixedFare: number | null
  currency: string
}

export type CreateTerritoryRequest = TerritoryRulesRequest & {
  name: string
  centerLatitude: number
  centerLongitude: number
  radiusKm: number
  constraints: Array<{ code: string; description: string }>
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

type ApiResponse<T> = {
  data: T
  location: string | null
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function extractIdFromLocation(location: string | null) {
  return location?.split('/').filter(Boolean).at(-1) ?? null
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    const message = errorBody ? `Erreur API ${response.status}: ${errorBody}` : `Erreur API ${response.status}`

    throw new ApiError(message, response.status)
  }

  const location = response.headers.get('Location')
  const data = response.status === 204 ? null : await response.json().catch(() => null)

  return { data: data as T, location }
}

export async function createIndividualUser() {
  const uniqueSuffix = Date.now()
  const response = await apiRequest<null>('/users/individual', {
    method: 'POST',
    body: {
      fullName: 'Passager Demo',
      email: `passager.demo.${uniqueSuffix}@example.com`,
      phoneNumber: '+33600000000',
    },
  })
  const userId = extractIdFromLocation(response.location)

  if (!userId) {
    throw new Error("Le back n'a pas retourne l'identifiant utilisateur dans le header Location.")
  }

  return userId
}

export async function createProfessionalUser(body?: Partial<CreateProfessionalUserRequest>) {
  const uniqueSuffix = Date.now()
  const response = await apiRequest<null>('/users/professional', {
    method: 'POST',
    body: {
      fullName: 'Chauffeur Demo',
      email: `chauffeur.demo.${uniqueSuffix}@example.com`,
      phoneNumber: '+33611111111',
      vtcLicenseNumber: `VTC-${uniqueSuffix}`,
      vtcLicenseExpiry: '2028-12-31',
      driversLicenseNumber: `PERMIS-${uniqueSuffix}`,
      driversLicenseExpiry: '2030-12-31',
      insuranceCompany: 'Assurance Exemple',
      insurancePolicyNumber: `POLICY-${uniqueSuffix}`,
      insuranceExpiry: '2027-12-31',
      vehicleMake: 'Toyota',
      vehicleModel: 'Prius',
      vehicleYear: 2022,
      vehicleLicensePlate: `DE-${String(uniqueSuffix).slice(-3)}-MO`,
      ...body,
    },
  })
  const userId = extractIdFromLocation(response.location)

  if (!userId) {
    throw new Error("Le back n'a pas retourne l'identifiant chauffeur dans le header Location.")
  }

  return userId
}

export async function getUser(userId: UUID) {
  const response = await apiRequest<UserDto>(`/users/${userId}`)
  return response.data
}

export async function getDriverProfile(userId: UUID) {
  const response = await apiRequest<DriverProfileDto>(`/users/${userId}/driver-profile`)
  return response.data
}

export async function addDriverProfile(userId: UUID, body: AddDriverProfileRequest) {
  await apiRequest<null>(`/users/${userId}/driver-profile`, { method: 'POST', body })
}

export async function approveDriverProfile(userId: UUID) {
  await apiRequest<null>(`/users/${userId}/driver-profile/approve`, { method: 'PUT' })
}

export async function rejectDriverProfile(userId: UUID, reason: string) {
  await apiRequest<null>(`/users/${userId}/driver-profile/reject`, {
    method: 'PUT',
    body: { reason },
  })
}

export async function addVehicle(userId: UUID, body: AddVehicleRequest) {
  const response = await apiRequest<null>(`/users/${userId}/vehicles`, {
    method: 'POST',
    body,
  })
  return extractIdFromLocation(response.location)
}

export async function activateDriverAvailability(userId: UUID, hasActivePassengerRide = false) {
  await apiRequest<null>(
    `/users/${userId}/availability/activate?hasActivePassengerRide=${String(hasActivePassengerRide)}`,
    { method: 'PUT' },
  )
}

export async function deactivateDriverAvailability(userId: UUID) {
  await apiRequest<null>(`/users/${userId}/availability/deactivate`, { method: 'PUT' })
}

export async function setActivityZone(userId: UUID, body: ZoneRequest) {
  await apiRequest<null>(`/users/${userId}/activity-zone`, { method: 'PUT', body })
}

export async function setWorkingZone(userId: UUID, body: ZoneRequest) {
  await apiRequest<null>(`/users/${userId}/working-zone`, { method: 'PUT', body })
}

export async function getAvailableDrivers(params: {
  latitude: number
  longitude: number
  radiusKm?: number
  accountType?: AccountType
}) {
  const searchParams = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    radiusKm: String(params.radiusKm ?? 5),
  })

  if (params.accountType) {
    searchParams.set('accountType', params.accountType)
  }

  const response = await apiRequest<AvailableDriverDto[]>(`/users/drivers/available?${searchParams}`)
  return response.data
}

export async function createRide(body: CreateRideRequest) {
  const response = await apiRequest<null>('/rides', {
    method: 'POST',
    body,
  })
  const rideId = extractIdFromLocation(response.location)

  if (!rideId) {
    throw new Error("Le back n'a pas retourne l'identifiant course dans le header Location.")
  }

  return rideId
}

export async function getRide(rideId: UUID) {
  const response = await apiRequest<RideDto>(`/rides/${rideId}`)
  return response.data
}

export async function startMatching(kind: MatchKind, body: MatchingRequest) {
  const response = await apiRequest<MatchDto>(`/matching/${kind}`, {
    method: 'POST',
    body,
  })
  return response.data
}

export async function getMatch(rideId: UUID) {
  const response = await apiRequest<MatchDto>(`/matching/${rideId}`)
  return response.data
}

export async function acceptMatch(rideId: UUID, driverId: UUID) {
  await apiRequest<null>(`/matching/${rideId}/accept?driverId=${driverId}`, { method: 'POST' })
}

export async function declineMatch(rideId: UUID, driverId: UUID) {
  await apiRequest<null>(`/matching/${rideId}/decline?driverId=${driverId}`, { method: 'POST' })
}

export async function cancelMatch(rideId: UUID) {
  await apiRequest<null>(`/matching/${rideId}/cancel`, { method: 'POST' })
}

export async function expireMatch(rideId: UUID) {
  await apiRequest<null>(`/matching/${rideId}/expire`, { method: 'POST' })
}

export async function searchRideOffers(params: {
  originLatitude: number
  originLongitude: number
  destinationLatitude: number
  destinationLongitude: number
  date: string
  preferredTime?: string
  requiredOptions?: string[]
}) {
  const searchParams = new URLSearchParams({
    originLatitude: String(params.originLatitude),
    originLongitude: String(params.originLongitude),
    destinationLatitude: String(params.destinationLatitude),
    destinationLongitude: String(params.destinationLongitude),
    date: params.date,
  })

  if (params.preferredTime) {
    searchParams.set('preferredTime', params.preferredTime)
  }

  params.requiredOptions?.forEach((option) => searchParams.append('requiredOptions', option))

  const response = await apiRequest<RideOfferSearchResultDto[]>(
    `/matching/ride-offers/search?${searchParams}`,
  )
  return response.data
}

export async function updateDriverPosition(driverId: UUID, latitude: number, longitude: number) {
  await apiRequest<null>(`/geolocation/drivers/${driverId}/position`, {
    method: 'PUT',
    body: { latitude, longitude },
  })
}

export async function getDriverPosition(driverId: UUID) {
  const response = await apiRequest<DriverPositionDto>(`/geolocation/drivers/${driverId}/position`)
  return response.data
}

export async function deleteDriverPosition(driverId: UUID) {
  await apiRequest<null>(`/geolocation/drivers/${driverId}/position`, { method: 'DELETE' })
}

export async function searchNearbyDrivers(latitude: number, longitude: number, radiusKm = 5) {
  const response = await apiRequest<NearbyDriverDto[]>(
    `/geolocation/drivers/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
  )
  return response.data
}

export async function calculateRoute(body: {
  originLatitude: number
  originLongitude: number
  destinationLatitude: number
  destinationLongitude: number
  maxRadiusKm: number
}) {
  const response = await apiRequest<RouteDto>('/geolocation/routes', { method: 'POST', body })
  return response.data
}

export async function getEta(params: {
  fromLatitude: number
  fromLongitude: number
  toLatitude: number
  toLongitude: number
}) {
  const searchParams = new URLSearchParams({
    fromLatitude: String(params.fromLatitude),
    fromLongitude: String(params.fromLongitude),
    toLatitude: String(params.toLatitude),
    toLongitude: String(params.toLongitude),
  })
  const response = await apiRequest<{ minutes: number }>(`/geolocation/eta?${searchParams}`)
  return response.data
}

export async function getCoveringTerritory(latitude: number, longitude: number) {
  const response = await apiRequest<TerritoryDto>(
    `/territories/covering?latitude=${latitude}&longitude=${longitude}`,
  )
  return response.data
}

export async function areCoordinatesCovered(latitude: number, longitude: number) {
  const response = await apiRequest<{ covered: boolean }>(
    `/territories/covered?latitude=${latitude}&longitude=${longitude}`,
  )
  return response.data.covered
}

export async function createTerritory(body: CreateTerritoryRequest) {
  const response = await apiRequest<null>('/territories', { method: 'POST', body })
  return extractIdFromLocation(response.location)
}

export async function getTerritory(territoryId: UUID) {
  const response = await apiRequest<TerritoryDto>(`/territories/${territoryId}`)
  return response.data
}

export async function updateTerritoryRules(territoryId: UUID, body: TerritoryRulesRequest) {
  await apiRequest<null>(`/territories/${territoryId}/rules`, { method: 'PUT', body })
}

export async function deactivateTerritory(territoryId: UUID) {
  await apiRequest<null>(`/territories/${territoryId}`, { method: 'DELETE' })
}

