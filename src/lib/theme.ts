import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const themeStorageKey = 'dddrive-theme'
const themeChangeEvent = 'dddrive-theme-change'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem(themeStorageKey)
  return isTheme(storedTheme) ? storedTheme : 'light'
}

export function applyStoredTheme() {
  applyTheme(getTheme())
}

export function setTheme(theme: Theme) {
  window.localStorage.setItem(themeStorageKey, theme)
  applyTheme(theme)
  window.dispatchEvent(new Event(themeChangeEvent))
}

function subscribeToTheme(callback: () => void) {
  const handleThemeChange = () => {
    applyStoredTheme()
    callback()
  }

  window.addEventListener('storage', handleThemeChange)
  window.addEventListener(themeChangeEvent, handleThemeChange)

  return () => {
    window.removeEventListener('storage', handleThemeChange)
    window.removeEventListener(themeChangeEvent, handleThemeChange)
  }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, getTheme, () => 'light')
}
