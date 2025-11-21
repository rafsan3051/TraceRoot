'use client'

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