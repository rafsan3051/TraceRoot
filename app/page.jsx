'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { QrCode, Truck, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useLocale } from '@/lib/i18n/locale-context'
import { t } from '@/lib/i18n/translations'

export default function Home() {
  const { user } = useAuth()
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false)
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Define which actions are available based on user role
  const showRegisterProduct = user?.role === 'FARMER' && user?.verified
  const showUpdateStatus = user && ['DISTRIBUTOR', 'RETAILER'].includes(user?.role) && user?.verified

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Prevent hydration mismatch by not rendering locale-dependent content until mounted
  if (!mounted) {
    return (
      <div className="space-y-12">
        <section className="space-y-6">
          <div className="text-center space-y-4 px-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 break-words px-2 leading-tight sm:leading-tight md:leading-tight lg:leading-tight py-2">
              TraceRoot
            </h1>
            <p className="mx-auto max-w-[90%] sm:max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl px-2 leading-relaxed">
              Loading...
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-6"
      >
        <motion.div 
          className="text-center space-y-4 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 break-words px-2 leading-tight sm:leading-tight md:leading-tight lg:leading-tight py-2">
            {t(locale, 'home.hero.title')}
          </h1>
          <p className="mx-auto max-w-[90%] sm:max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl px-2 leading-relaxed">
            {t(locale, 'home.hero.subtitle')}
          </p>
        </motion.div>

        {user ? (
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {showRegisterProduct && (
              <motion.div variants={item}>
                <Link
                  href="/products/register"
                  className="group relative block rounded-xl border p-6 sm:p-8 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all min-h-[180px]"
                >
                  <div className="relative z-10">
                    <motion.div 
                      className="mb-4 inline-block rounded-lg bg-blue-500/10 p-3"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <QrCode className="h-6 w-6 text-blue-500" />
                    </motion.div>
                    <h3 className="mb-2 font-semibold text-base sm:text-lg break-words">{t(locale, 'home.actions.register.title')}</h3>
                    <p className="text-sm text-muted-foreground break-words">
                      {t(locale, 'home.actions.register.description')}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </motion.div>
            )}
            
            {showUpdateStatus && (
              <motion.div variants={item}>
                <Link
                  href="/update"
                  className="group relative block rounded-xl border p-6 sm:p-8 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all min-h-[180px]"
                >
                  <div className="relative z-10">
                    <motion.div 
                      className="mb-4 inline-block rounded-lg bg-emerald-500/10 p-3"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Truck className="h-6 w-6 text-emerald-500" />
                    </motion.div>
                    <h3 className="mb-2 font-semibold text-base sm:text-lg break-words">{t(locale, 'home.actions.track.title')}</h3>
                    <p className="text-sm text-muted-foreground break-words">
                      {t(locale, 'home.actions.track.description')}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </motion.div>
            )}

            <motion.div variants={item}>
              <Link
                href="/track"
                className="group relative block rounded-xl border p-6 sm:p-8 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all min-h-[180px]"
              >
                <div className="relative z-10">
                  <motion.div 
                    className="mb-4 inline-block rounded-lg bg-blue-500/10 p-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Search className="h-6 w-6 text-blue-500" />
                  </motion.div>
                  <h3 className="mb-2 font-semibold text-base sm:text-lg break-words">{t(locale, 'home.actions.verify.title')}</h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {t(locale, 'home.actions.verify.description')}
                  </p>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="max-w-4xl mx-auto space-y-6 px-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div 
                  className="rounded-xl border p-6 bg-card min-h-[140px] flex flex-col items-center justify-center text-center"
                  whileHover={{ y: -5, shadow: "lg" }}
                >
                  <QrCode className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 break-words">{t(locale, 'home.features.register.title')}</h3>
                  <p className="text-sm text-muted-foreground break-words">{t(locale, 'home.features.register.subtitle')}</p>
                </motion.div>
                <motion.div 
                  className="rounded-xl border p-6 bg-card min-h-[140px] flex flex-col items-center justify-center text-center"
                  whileHover={{ y: -5, shadow: "lg" }}
                  transition={{ delay: 0.1 }}
                >
                  <Truck className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 break-words">{t(locale, 'home.features.track.title')}</h3>
                  <p className="text-sm text-muted-foreground break-words">{t(locale, 'home.features.track.subtitle')}</p>
                </motion.div>
                <motion.div 
                  className="rounded-xl border p-6 bg-card min-h-[140px] flex flex-col items-center justify-center text-center sm:col-span-2 lg:col-span-1"
                  whileHover={{ y: -5, shadow: "lg" }}
                  transition={{ delay: 0.2 }}
                >
                  <Search className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 break-words">{t(locale, 'home.features.verify.title')}</h3>
                  <p className="text-sm text-muted-foreground break-words">{t(locale, 'home.features.verify.subtitle')}</p>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-emerald-500 px-8 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-lg"
                >
                  {t(locale, 'home.cta.getStarted')} →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-8 py-12"
      >
        <div className="text-center space-y-4">
          <motion.h2 
            className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Blockchain-Powered Supply Chain Integrity
          </motion.h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From farm to table, every product journey is recorded immutably on the blockchain,
            ensuring complete transparency and trust throughout your supply chain.
          </p>
        </div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div 
            className="relative group"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative p-6 rounded-2xl border bg-card/50 backdrop-blur">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure Registration</h3>
              <p className="text-sm text-muted-foreground">
                Generate tamper-proof QR codes backed by blockchain verification
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="relative group"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative p-6 rounded-2xl border bg-card/50 backdrop-blur">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Real-Time Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor product movement across the entire supply chain network
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="relative group"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative p-6 rounded-2xl border bg-card/50 backdrop-blur">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Verification</h3>
              <p className="text-sm text-muted-foreground">
                Scan any QR code to access complete product authenticity records
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="relative group"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative p-6 rounded-2xl border bg-card/50 backdrop-blur">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Immutable History</h3>
              <p className="text-sm text-muted-foreground">
                Every transaction permanently recorded with cryptographic security
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  )
}