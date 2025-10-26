import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'

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

  return product
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">Product Details and History</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <QRCodeSVG value={product.qrCodeUrl} size={128} />
          <p className="text-sm text-muted-foreground">Scan to verify</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Product Information</h2>
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
    </div>
  )
}