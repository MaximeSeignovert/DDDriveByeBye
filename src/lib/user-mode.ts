import { useSyncExternalStore } from 'react'

export type UserMode = 'particulier' | 'professionnel'

const userModeStorageKey = 'dddrive-user-mode'
const userModeChangeEvent = 'dddrive-user-mode-change'

function isUserMode(value: string | null): value is UserMode {
  return value === 'particulier' || value === 'professionnel'
}

export function getUserMode(): UserMode {
  if (typeof window === 'undefined') return 'particulier'

  const storedMode = window.localStorage.getItem(userModeStorageKey)
  return isUserMode(storedMode) ? storedMode : 'particulier'
}

export function setUserMode(mode: UserMode) {
  window.localStorage.setItem(userModeStorageKey, mode)
  window.dispatchEvent(new Event(userModeChangeEvent))
}

function subscribeToUserMode(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(userModeChangeEvent, callback)

  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(userModeChangeEvent, callback)
  }
}

export function useUserMode() {
  return useSyncExternalStore(subscribeToUserMode, getUserMode, () => 'particulier')
}
