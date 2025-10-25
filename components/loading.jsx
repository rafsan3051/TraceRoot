'use client'

import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="h-12 w-12 border-4 border-primary rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <LoadingSpinner />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </motion.div>
    </div>
  )
}