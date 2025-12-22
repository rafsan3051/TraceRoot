'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Use relative imports from the components directory to avoid alias resolution issues
const Navbar = dynamic(() => import('./navbar').then(mod => mod.Navbar), {
  ssr: false,
  loading: () => <div className="h-16 border-b bg-background/80 backdrop-blur-sm" />
})

const Footer = dynamic(() => import('./footer').then(mod => mod.Footer), {
  ssr: false
})

export default function LayoutWrapper({ children }) {
  // Blur any focused input when clicking outside to avoid stray carets on the page
  useEffect(() => {
    const handleMouseDown = (event) => {
      const active = document.activeElement
      if (!(active instanceof HTMLElement)) return

      const focusableSelector = 'input, textarea, select, button, [contenteditable="true"], [contenteditable=true], [role="textbox"], [data-keep-focus]'

      const target = event.target
      const targetIsFocusable = target instanceof HTMLElement && target.closest(focusableSelector)
      const activeIsFocusable = active.matches(focusableSelector)

      if (activeIsFocusable && !targetIsFocusable) {
        active.blur()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      <Footer />
    </div>
  )
}