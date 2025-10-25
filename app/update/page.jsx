'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function UpdateProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(null)

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
      const formData = {
        productId: product.id,
        eventType: e.target.eventType.value,
        location: e.target.location.value
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Update Product Status</h1>
        <p className="text-muted-foreground">
          Record a new supply chain event for a product.
        </p>
      </div>

      {!product ? (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="productId" className="text-sm font-medium">
              Product ID
            </label>
            <input
              id="productId"
              name="productId"
              required
              className="w-full p-2 border rounded-md"
              placeholder="Enter product ID"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-md"
          >
            Search Product
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">Origin: {product.origin}</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
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

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-md"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
              <button
                type="button"
                onClick={() => setProduct(null)}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 p-2 rounded-md"
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