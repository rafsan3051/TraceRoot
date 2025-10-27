'use client'

import { MapPin, Navigation } from 'lucide-react'

/**
 * Component to display location information with a Google Maps link
 * @param {Object} props
 * @param {number} props.latitude - Latitude coordinate
 * @param {number} props.longitude - Longitude coordinate
 * @param {number} props.accuracy - Location accuracy in meters (optional)
 * @param {string} props.label - Label for the location (e.g., "Registration Location")
 */
export default function LocationMap({ latitude, longitude, accuracy, label = 'Location' }) {
  if (!latitude || !longitude) {
    return null
  }

  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
  const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m)` : ''

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-emerald-600" />
        <h4 className="font-medium">{label}</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Latitude:</span>
          <span className="font-mono">{latitude.toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Longitude:</span>
          <span className="font-mono">{longitude.toFixed(6)}</span>
        </div>
        {accuracy && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accuracy:</span>
            <span>±{Math.round(accuracy)} meters</span>
          </div>
        )}
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
      >
        <Navigation className="h-4 w-4" />
        View on Google Maps
      </a>
    </div>
  )
}
