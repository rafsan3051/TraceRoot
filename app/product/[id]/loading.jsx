'use client'

import SupplyChainLoader from '@/components/SupplyChainLoader'

export default function ProductLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <SupplyChainLoader label="Loading product" />
    </div>
  )
}
