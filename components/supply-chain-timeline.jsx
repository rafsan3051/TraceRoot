'use client'

import { motion } from 'framer-motion'
import { Package, Truck, Store, CheckCircle, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'

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

const eventColors = {
  REGISTERED: 'blue',
  HARVESTED: 'emerald',
  PROCESSED: 'purple',
  PICKED_UP: 'yellow',
  IN_TRANSIT: 'orange',
  DELIVERED: 'cyan',
  RECEIVED: 'indigo',
  IN_STOCK: 'teal',
  SOLD: 'green',
  default: 'gray'
}

export function SupplyChainTimeline({ events, product }) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  // Add product registration as first event if not in events
  const allEvents = [
    {
      id: 'registration',
      eventType: 'REGISTERED',
      location: product.origin,
      timestamp: product.createdAt,
      blockchainTxId: product.blockchainTxId,
      isRegistration: true
    },
    ...sortedEvents
  ]

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />

      {/* Events */}
      <div className="space-y-8">
        {allEvents.map((event, index) => {
          const Icon = eventIcons[event.eventType] || eventIcons.default
          const color = eventColors[event.eventType] || eventColors.default
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
                className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg shadow-${color}-500/50`}
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
                      {event.eventType.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.timestamp), 'PPP')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.timestamp), 'p')}
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Journey Progress</span>
                    <span>{Math.round(((index + 1) / allEvents.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((index + 1) / allEvents.length) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                      className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
                    />
                  </div>
                </div>

                {/* Blockchain info */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Blockchain Transaction</div>
                    <code className="text-xs font-mono break-all">{event.blockchainTxId}</code>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                </div>

                {/* Additional metadata if available */}
                {event.metadata && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">Additional Information</div>
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
                    Current Status
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Journey complete indicator */}
      {allEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: allEvents.length * 0.1 + 0.5 }}
          className="mt-8 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Journey Tracked</h4>
              <p className="text-sm text-muted-foreground">
                {allEvents.length} checkpoint{allEvents.length !== 1 ? 's' : ''} recorded on blockchain
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
