import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import QrCodeCard from '@/components/qr-code-card'
import { SupplyChainTimeline } from '@/components/supply-chain-timeline'
import { SupplyChainMap } from '@/components/supply-chain-map'
import LocationMap from '@/components/LocationMap'
import { getSession } from '@/lib/auth/auth-utils'

async function getProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: {
          timestamp: 'desc'
        }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Convert Decimal to number for Client Component compatibility
  return {
    ...product,
    price: product.price ? Number(product.price) : 0
  }
}

export default async function ProductPage({ params }) {
  const session = await getSession()
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)

  if (!session) {
    return (
        <div className="container mx-auto px-4 py-8 sm:py-16 text-center max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{product.name}</h1>
          <div className="p-6 sm:p-8 rounded-xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">You must login or register to view product details and supply chain history.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a href={`/auth?redirect=/product/${product.id}`} className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition text-sm sm:text-base">Login</a>
              <a href={`/auth/register?redirect=/product/${product.id}`} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition text-sm sm:text-base">Register</a>
          </div>
        </div>
          <div className="mt-6 sm:mt-8 text-muted-foreground text-xs sm:text-sm">Only product name is visible to guests.</div>
      </div>
    )
  }

  return (
      <div className="container mx-auto px-0 py-6 sm:py-8 max-w-4xl space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Product Details and History</p>
        </div>
          <QrCodeCard
            productId={product.id}
            versionKey={(product.events?.[0]?.timestamp ?? product.updatedAt).toISOString?.() ?? String(product.updatedAt)}
            size={128}
          />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Product Information</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Origin</dt>
              <dd className="text-lg">{product.origin}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Manufacture Date</dt>
              <dd className="text-lg">
                {format(new Date(product.manufactureDate), 'PPP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Registration Date</dt>
              <dd className="text-lg">
                {format(new Date(product.createdAt), 'PPP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Blockchain Reference</dt>
              <dd className="text-sm font-mono">{product.blockchainTxId}</dd>
            </div>
          </dl>

          {/* Registration Location */}
          {product.latitude && product.longitude && (
            <div className="mt-6">
              <LocationMap
                latitude={product.latitude}
                longitude={product.longitude}
                accuracy={product.locationAccuracy}
                label="Registration Location"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Supply Chain History</h2>
          <div className="space-y-4">
            {product.events.length > 0 ? (
              product.events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{event.eventType}</h3>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(event.timestamp), 'PPp')}
                    </span>
                  </div>
                  <p className="text-muted-foreground">Location: {event.location}</p>
                  {event.latitude && event.longitude && (
                    <p className="text-sm text-muted-foreground">
                      📍 {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                      {event.locationAccuracy && ` (±${Math.round(event.locationAccuracy)}m)`}
                    </p>
                  )}
                  <p className="text-sm font-mono text-muted-foreground">
                    TX: {event.blockchainTxId}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No supply chain events recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Visual Supply Chain Journey */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Supply Chain Journey</h2>
          <SupplyChainTimeline events={product.events} product={product} />
        </div>
        
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Journey Map</h2>
          <SupplyChainMap events={product.events} product={product} />
        </div>
      </div>
    </div>
  )
}