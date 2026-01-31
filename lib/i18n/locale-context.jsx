'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const LocaleContext = createContext({
  locale: 'en-BD',
  setLocale: () => {},
})

function getClientLocale() {
  try {
    const cookieMatch = document.cookie.match(/(?:^|; )locale=([^;]+)/)
    const cookieLocale = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
    if (cookieLocale === 'en-BD' || cookieLocale === 'bn-BD') {
      return cookieLocale
    }

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
  const [locale, setLocaleState] = useState('en-BD')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const next = getClientLocale()
    if (next !== locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(next)
    }
  }, [locale])

  const setLocale = (newLocale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
      document.cookie = `locale=${encodeURIComponent(newLocale)}; path=/; max-age=31536000`
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
