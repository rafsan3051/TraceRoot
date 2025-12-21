'use client'

import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Milestone } from 'lucide-react'
import { format } from 'date-fns'

const locationColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-yellow-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-blue-500',
]

export function SupplyChainMap({ events, productOrigin, productCreatedAt }) {
  // Ensure events is an array
  const safeEvents = Array.isArray(events) ? events : []
  const sortedEvents = [...safeEvents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  // Combine product origin with events
  const locations = [
    {
      id: 'origin',
      location: productOrigin,
      eventType: 'REGISTERED',
      timestamp: productCreatedAt,
      isOrigin: true
    },
    ...sortedEvents.map(e => ({
      id: e.id,
      location: e.location,
      eventType: e.eventType,
      timestamp: e.timestamp
    }))
  ]

  // Group by unique locations
  const uniqueLocations = locations.reduce((acc, curr) => {
    const existing = acc.find(l => l.location === curr.location)
    if (existing) {
      existing.events.push(curr)
    } else {
      acc.push({
        location: curr.location,
        events: [curr],
        firstTimestamp: curr.timestamp
      })
    }
    return acc
  }, [])

  return (
    <div className="space-y-8">
      {/* Journey Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
              {uniqueLocations.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Locations Visited</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              {locations.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
              {locations.length > 1 
                ? Math.round((new Date(locations[locations.length - 1].timestamp) - new Date(locations[0].timestamp)) / (1000 * 60 * 60 * 24))
                : 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Days in Transit</div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Map Flow */}
      <div className="relative p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(to right, #3b82f6 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Location nodes */}
        <div className="relative flex flex-wrap justify-center items-center gap-4">
          {uniqueLocations.map((loc, index) => {
            const colorClass = locationColors[index % locationColors.length]
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15, type: 'spring' }}
                className="relative group"
              >
                {/* Connection arrow */}
                {index < uniqueLocations.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 z-0 hidden md:block"
                  >
                    <ArrowRight className="w-6 h-6 text-blue-500/50" />
                  </motion.div>
                )}

                {/* Location card */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative z-10 w-48 p-4 rounded-xl bg-card border-2 border-transparent hover:border-primary shadow-lg cursor-pointer"
                >
                  {/* Location marker */}
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center mb-3 shadow-lg`}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>

                  {/* Location name */}
                  <h3 className="text-center font-bold mb-2 truncate">{loc.location}</h3>

                  {/* Event count badge */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Milestone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {loc.events.length} event{loc.events.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-center text-muted-foreground">
                    {format(new Date(loc.firstTimestamp), 'MMM d, yyyy')}
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-popover border rounded-lg shadow-xl p-3 min-w-[200px]">
                      <div className="text-xs font-semibold mb-2">Events at this location:</div>
                      <div className="space-y-1">
                        {loc.events.map((event, i) => (
                          <div key={i} className="text-xs flex justify-between gap-2">
                            <span className="font-medium">{event.eventType.replace(/_/g, ' ')}</span>
                            <span className="text-muted-foreground">{format(new Date(event.timestamp), 'HH:mm')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Position indicator */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {index + 1}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Journey stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: uniqueLocations.length * 0.15 + 0.5 }}
          className="mt-8 pt-6 border-t"
        >
          <div className="flex flex-wrap justify-around gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Origin</div>
              <div className="font-semibold">{uniqueLocations[0]?.location || 'N/A'}</div>
            </div>
            <div className="hidden md:block">
              <ArrowRight className="w-5 h-5 text-muted-foreground mt-3" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Location</div>
              <div className="font-semibold">{uniqueLocations[uniqueLocations.length - 1]?.location || 'N/A'}</div>
            </div>
            <div className="hidden md:block">
              <div className="text-xs text-muted-foreground mb-1">Distance Traveled</div>
              <div className="font-semibold text-blue-500">~{uniqueLocations.length * 150} km</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Event breakdown by location */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueLocations.map((loc, index) => {
          const colorClass = locationColors[index % locationColors.length]
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-4 rounded-xl border bg-card hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{loc.location}</h4>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(loc.firstTimestamp), 'PPP')}
                  </div>
                  <div className="mt-2 space-y-1">
                    {loc.events.map((event, i) => (
                      <div key={i} className="text-xs bg-muted px-2 py-1 rounded">
                        {event.eventType.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
