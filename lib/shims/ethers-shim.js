// Minimal shim for 'ethers' in mock mode to avoid build-time resolution
// This file should never be executed in production when USE_REAL_BLOCKCHAIN=true.
export const ethers = new Proxy({}, {
  get() {
    throw new Error(
      "Ethers is not available. Set USE_REAL_BLOCKCHAIN=true and install 'ethers' to enable blockchain features."
    )
  }
})
