import { useState, useEffect } from 'react'

/**
 * Custom hook to get user's geolocation using Browser Geolocation API
 * @param {boolean} autoFetch - Whether to automatically fetch location on mount
 * @returns {Object} - { location, error, loading, getLocation }
 */
export default function useGeolocation(autoFetch = false) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return Promise.reject(new Error('Geolocation not supported'))
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString()
          }
          setLocation(locationData)
          setLoading(false)
          resolve(locationData)
        },
        (err) => {
          let errorMessage = 'Unable to retrieve location'
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings.'
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your device settings.'
              break
            case err.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = err.message || 'Unknown error occurred while getting location'
          }
          
          setError(errorMessage)
          setLoading(false)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true, // Use GPS if available
          timeout: 10000, // 10 seconds
          maximumAge: 0 // Don't use cached position
        }
      )
    })
  }

  useEffect(() => {
    if (autoFetch) {
      getLocation()
    }
  }, [autoFetch])

  return {
    location,
    error,
    loading,
    getLocation
  }
}
