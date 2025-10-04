'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSettingsStore } from '@/store'

type ThemeProviderProps = {
  children: React.ReactNode
}

const ThemeProviderContext = createContext<{}>({})

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettingsStore()

  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    root.classList.add(settings.appearance.theme)
    
    // Apply accent color as CSS custom property
    root.style.setProperty('--accent-color', settings.appearance.accentColor)
  }, [settings.appearance.theme, settings.appearance.accentColor])

  return (
    <ThemeProviderContext.Provider value={{}}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}