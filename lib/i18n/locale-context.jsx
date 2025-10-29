'use client'

import { createContext, useContext, useState } from 'react'

const LocaleContext = createContext({
  locale: 'en-BD',
  setLocale: () => {},
})

// Get locale from localStorage only on client, default on server
function getInitialLocale() {
  // Server-side always returns default
  if (typeof window === 'undefined') return 'en-BD'
  
  // Client-side reads from localStorage once
  try {
    const saved = localStorage.getItem('locale')
    if (saved === 'en-BD' || saved === 'bn-BD') {
      return saved
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return 'en-BD'
}

export function LocaleProvider({ children }) {
  // Use lazy initializer - only runs once, no effects needed
  const [locale, setLocaleState] = useState(getInitialLocale)

  const setLocale = (newLocale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
