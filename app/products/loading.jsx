'use client'

import SupplyChainLoader from '@/components/SupplyChainLoader'

export default function ProductsLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <SupplyChainLoader label="Loading products" />
    </div>
  )
}
