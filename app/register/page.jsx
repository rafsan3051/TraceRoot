'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QrCodeCard from '@/components/qr-code-card'
import toast from 'react-hot-toast'
import useGeolocation from '@/hooks/useGeolocation'
import { MapPin, Loader2 } from 'lucide-react'

export default function RegisterProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(null)
  const { location, error: geoError, loading: geoLoading, getLocation } = useGeolocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check auth and verification status
      const checkRes = await fetch('/api/auth/check')
      const checkData = await checkRes.json()

      if (!checkData.user) {
        throw new Error('You must be logged in to register a product. Please login or register an account.')
      }

      if (!checkData.user.verified) {
        throw new Error('Your account is not verified yet. An admin must verify your account before registering products.')
      }

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
        name: e.target.name.value,
        origin: e.target.origin.value,
        manufactureDate: e.target.manufactureDate.value,
        latitude: geoData?.latitude,
        longitude: geoData?.longitude,
        locationAccuracy: geoData?.accuracy
      }

      const response = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setProduct(data.product)
        toast.success('Product registered successfully')
      } else {
        throw new Error(data.error || 'Failed to register product')
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
        <h1 className="text-2xl sm:text-3xl font-bold">Register New Product</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Add a new product to the blockchain for tracking and verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
          <label htmlFor="name" className="text-sm font-medium">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full p-2 border rounded-md"
            placeholder="Enter product name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="origin" className="text-sm font-medium">
            Origin
          </label>
          <input
            id="origin"
            name="origin"
            required
            className="w-full p-2 border rounded-md"
            placeholder="Enter product origin"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="manufactureDate" className="text-sm font-medium">
            Manufacture Date
          </label>
          <input
            id="manufactureDate"
            name="manufactureDate"
            type="date"
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded-md text-sm sm:text-base font-medium"
        >
          {loading ? 'Registering...' : 'Register Product'}
        </button>
      </form>

      {product && (
        <div className="border rounded-lg p-4 sm:p-6 space-y-4 mt-6">
          <h2 className="text-lg sm:text-xl font-semibold">Product Registered Successfully</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <QrCodeCard
              productId={product.id}
              versionKey={product.createdAt || ''}
              size={typeof window !== 'undefined' ? (window.innerWidth < 640 ? 160 : 200) : 200}
            />
          </div>

          <div className="space-y-2 text-sm sm:text-base">
            <p className="break-all"><strong>Product ID:</strong> {product.id}</p>
            <p className="break-all"><strong>Blockchain Transaction:</strong> {product.blockchainTxId}</p>
            <p className="break-all"><strong>QR Code URL:</strong> {product.qrCodeUrl}</p>
          </div>

          <button
            onClick={() => router.push(`/product/${product.id}`)}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 p-3 rounded-md text-sm sm:text-base font-medium"
          >
            View Product Details
          </button>
        </div>
      )}
    </div>
  )
}