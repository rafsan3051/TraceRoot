'use client'

import { motion } from 'framer-motion'
import { Package, Truck, Store, CheckCircle, BadgeCheck, MapPin, Calendar } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { t } from '@/lib/i18n/translations'

const eventIcons = {
  REGISTERED: Package,
  HARVESTED: Package,
  PROCESSED: Package,
  PICKED_UP: Truck,
  IN_TRANSIT: Truck,
  DELIVERED: Truck,
  RECEIVED: Store,
  IN_STOCK: Store,
  SOLD: CheckCircle,
  default: MapPin
}

// Tailwind cannot generate classes from fully dynamic color tokens reliably.
// Map each event to explicit gradient and shadow class tokens to ensure output.
const eventStyles = {
  REGISTERED: {
    grad: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/50',
  },
  HARVESTED: {
    grad: 'from-green-500 to-green-600',
    shadow: 'shadow-green-500/50',
  },
  PROCESSED: {
    grad: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/50',
  },
  PICKED_UP: {
    grad: 'from-yellow-500 to-yellow-600',
    shadow: 'shadow-yellow-500/50',
  },
  IN_TRANSIT: {
    grad: 'from-orange-500 to-orange-600',
    shadow: 'shadow-orange-500/50',
  },
  DELIVERED: {
    grad: 'from-cyan-500 to-cyan-600',
    shadow: 'shadow-cyan-500/50',
  },
  RECEIVED: {
    grad: 'from-indigo-500 to-indigo-600',
    shadow: 'shadow-indigo-500/50',
  },
  IN_STOCK: {
    grad: 'from-teal-500 to-teal-600',
    shadow: 'shadow-teal-500/50',
  },
  SOLD: {
    grad: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/50',
  },
  default: {
    grad: 'from-gray-500 to-gray-600',
    shadow: 'shadow-gray-500/50',
  },
}

export function SupplyChainTimeline({ events, productOrigin, productCreatedAt, productBlockchainTxId }) {
  const { locale } = useLocale()

  const formatDateOnly = (date) => new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))

  const formatTimeOnly = (date) => new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))

  const getEventTypeLabel = (eventType) => {
    const translated = t(locale, `status.${eventType}`)
    if (translated === `status.${eventType}`) {
      return eventType.replace(/_/g, ' ')
    }
    return translated
  }

  // Ensure events is an array
  const safeEvents = Array.isArray(events) ? events : []
  const sortedEvents = [...safeEvents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  // Add product registration as first event if not in events
  const allEvents = [
    {
      id: 'registration',
      eventType: 'REGISTERED',
      location: productOrigin,
      timestamp: productCreatedAt,
      blockchainTxId: productBlockchainTxId,
      isRegistration: true
    },
    ...sortedEvents
  ]

  return (
    <div className="relative pl-4">
      {/* Timeline line - centered through icon circles */}
      <div className="pointer-events-none">
        <div className="absolute z-0 left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />
        {/* Top/Bottom caps to avoid line extending beyond first/last icons */}
        <div className="absolute z-0 left-12 top-0 h-12 w-1 -translate-x-[0.5px] bg-background" />
        <div className="absolute z-0 left-12 bottom-0 h-12 w-1 -translate-x-[0.5px] bg-background" />
      </div>

      {/* Events */}
      <div className="space-y-6">
        {allEvents.map((event, index) => {
          const Icon = eventIcons[event.eventType] || eventIcons.default
          const style = eventStyles[event.eventType] || eventStyles.default
          const isLast = index === allEvents.length - 1

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-6 items-start"
            >
              {/* Timeline dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className={`relative z-20 flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${style.grad} shadow-lg ${style.shadow}`}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Event card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                className="flex-1 p-6 rounded-xl border bg-card hover:border-primary/50 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {getEventTypeLabel(event.eventType)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      {formatDateOnly(event.timestamp)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimeOnly(event.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{t(locale, 'timeline.journeyProgress')}</span>
                    <span>{Math.round(((index + 1) / allEvents.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((index + 1) / allEvents.length) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                      className={`h-full bg-gradient-to-r ${style.grad}`}
                    />
                  </div>
                </div>

                {/* Blockchain info */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="text-xs text-muted-foreground mb-1">{t(locale, 'timeline.blockchainTransaction')}</div>
                    <code className="text-xs font-mono break-all block">{event.blockchainTxId}</code>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium flex-shrink-0">
                    <CheckCircle className="w-3 h-3" />
                    {t(locale, 'timeline.verified')}
                  </div>
                </div>

                {/* Additional metadata if available */}
                {event.metadata && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">{t(locale, 'timeline.additionalInfo')}</div>
                    <pre className="text-xs mt-1 p-2 bg-muted rounded">{JSON.stringify(event.metadata, null, 2)}</pre>
                  </div>
                )}

                {/* Status badge */}
                {isLast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                    className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg"
                  >
                    {t(locale, 'timeline.currentStatus')}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Journey complete indicator as a final timeline row (icon outside the card) */}
      {allEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: allEvents.length * 0.1 + 0.5 }}
          className="relative mt-6 flex gap-6 items-start"
        >
          {/* Left icon aligned with timeline */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="relative z-10 flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40"
          >
            <BadgeCheck className="w-8 h-8 text-white" />
          </motion.div>

          {/* Completion card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 p-6 rounded-xl border bg-card"
          >
            <h4 className="font-bold text-lg">Journey Tracked</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {allEvents.length} checkpoint{allEvents.length !== 1 ? 's' : ''} recorded on blockchain
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
