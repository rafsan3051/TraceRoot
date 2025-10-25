'use client'

import { useEffect, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="h-16 border-b bg-background/80 backdrop-blur-sm" />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}