'use client'

import { motion } from 'framer-motion'
import { Truck, Package, Link as Chain } from 'lucide-react'

export default function SupplyChainLoader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 w-full">
      <div className="relative w-56 h-16">
        {/* track line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-500/30" />
        {/* moving truck */}
        <motion.div
          role="progressbar"
          aria-label={label}
          initial={{ x: 0 }}
          animate={{ x: 'calc(100% - 2.5rem)' }}
          transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center"
        >
          <Truck className="w-5 h-5 text-white" />
        </motion.div>
        {/* package pulse at end */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500/30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="text-sm text-muted-foreground">Securing supply chain data…</div>
    </div>
  )
}
