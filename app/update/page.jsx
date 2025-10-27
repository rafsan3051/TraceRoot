'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useGeolocation from '@/hooks/useGeolocation'
import { MapPin, Loader2 } from 'lucide-react'

export default function UpdateProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(null)
  const { location, error: geoError, loading: geoLoading, getLocation } = useGeolocation()

  const handleSearch = async (e) => {
    e.preventDefault()
    const productId = e.target.productId.value

    try {
      const response = await fetch(`/api/product?id=${productId}`)
      const data = await response.json()

      if (data.products?.[0]) {
        setProduct(data.products[0])
      } else {
        toast.error('Product not found')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch product')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current location
      let geoData = location
      if (!geoData) {
        try {
          geoData = await getLocation()
        } catch (err) {
          // Location is optional, continue without it
          console.warn('Could not get location:', err)
        }
      }

      const formData = {
        productId: product.id,
        eventType: e.target.eventType.value,
        location: e.target.location.value,
        latitude: geoData?.latitude,
        longitude: geoData?.longitude,
        locationAccuracy: geoData?.accuracy
      }

      const response = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Status updated successfully')
        router.push(`/product/${product.id}`)
      } else {
        throw new Error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Update Product Status</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Record a new supply chain event for a product.
        </p>
      </div>

      {!product ? (
        <form onSubmit={handleSearch} className="space-y-4 mt-6">
          <div className="space-y-2">
            <label htmlFor="productId" className="text-sm font-medium">
              Product ID
            </label>
            <input
              id="productId"
              name="productId"
              required
              className="w-full p-3 border rounded-md text-sm sm:text-base"
              placeholder="Enter product ID"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded-md text-sm sm:text-base font-medium"
          >
            Search Product
          </button>
        </form>
      ) : (
        <div className="space-y-6 mt-6">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-base sm:text-lg">{product.name}</h2>
            <p className="text-sm text-muted-foreground">Origin: {product.origin}</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Location Status Indicator */}
            <div className="rounded-lg border p-3 sm:p-4 bg-muted/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2">
                  <MapPin className={`h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0 ${location ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">
                      {location ? 'Location Captured' : 'Location Not Set'}
                    </p>
                    {location && (
                      <p className="text-xs text-muted-foreground break-all">
                        Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                        {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                      </p>
                    )}
                    {geoError && (
                      <p className="text-xs text-red-600">{geoError}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={geoLoading}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
                >
                  {geoLoading ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Getting...
                    </span>
                  ) : (
                    location ? 'Refresh' : 'Get Location'
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="eventType" className="text-sm font-medium">
                Event Type
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="SHIPPED">Shipped</option>
                <option value="RECEIVED">Received</option>
                <option value="PROCESSED">Processed</option>
                <option value="STORED">Stored</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                name="location"
                required
                className="w-full p-2 border rounded-md"
                placeholder="Enter current location"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded-md text-sm sm:text-base font-medium"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
              <button
                type="button"
                onClick={() => setProduct(null)}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 p-3 rounded-md text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}