'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'

export default function RegisterProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(null)

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

      const formData = {
        name: e.target.name.value,
        origin: e.target.origin.value,
        manufactureDate: e.target.manufactureDate.value
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Register New Product</h1>
        <p className="text-muted-foreground">
          Add a new product to the blockchain for tracking and verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-md"
        >
          {loading ? 'Registering...' : 'Register Product'}
        </button>
      </form>

      {product && (
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Product Registered Successfully</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <QRCode value={product.qrCodeUrl} size={200} />
            <p className="text-sm text-muted-foreground">
              Scan this QR code to view product details
            </p>
          </div>

          <div className="space-y-2">
            <p><strong>Product ID:</strong> {product.id}</p>
            <p><strong>Blockchain Transaction:</strong> {product.blockchainTxId}</p>
            <p><strong>QR Code URL:</strong> {product.qrCodeUrl}</p>
          </div>

          <button
            onClick={() => router.push(`/product/${product.id}`)}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 p-2 rounded-md"
          >
            View Product Details
          </button>
        </div>
      )}
    </div>
  )
}