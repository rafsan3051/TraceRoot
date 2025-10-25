'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">Something went wrong!</h1>
        <p className="text-xl text-muted-foreground">{error.message}</p>
        <div className="flex justify-center gap-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </motion.button>
          <Link 
            href="/"
            className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
          >
            Go home
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}