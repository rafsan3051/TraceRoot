'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '../lib/auth/auth-context'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/track', label: 'Track' },
     ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-blockchain.svg"
              alt="TraceRoot Logo"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">Profile</Link>
                <button onClick={logout} className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">Logout</button>
              </div>
            ) : (
              <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Login / Register</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden py-4 space-y-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className={`block text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t space-y-4">
              <ThemeToggle />
              {user ? (
                <>
                  <Link href="/profile" className="block text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left text-sm font-medium text-red-500 hover:text-red-600 transition-colors">Logout</button>
                </>
              ) : (
                <Link href="/auth" className="block text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Login / Register</Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
