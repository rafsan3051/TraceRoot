const { expect } = require('chai')

describe('SupplyChain price history', function () {
  it('allows owner to update price and keeps history', async function () {
    const [owner, other] = await hre.ethers.getSigners()

    const SupplyChain = await hre.ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.waitForDeployment()

    // Create product sets owner
    await supplyChain.createProduct('P1', 'Dhaka', 'Init')

    // First price update
    await expect(supplyChain.updatePrice('P1', 100, 'First'))
      .to.emit(supplyChain, 'PriceUpdated')

    const latest1 = await supplyChain.getLatestPrice('P1')
    expect(latest1).to.equal(100n)

    // Non-owner cannot update
    await expect(supplyChain.connect(other).updatePrice('P1', 200, 'Invalid'))
      .to.be.revertedWith('Not the owner')

    // Second price update
    await expect(supplyChain.updatePrice('P1', 150, 'Second'))
      .to.emit(supplyChain, 'PriceUpdated')

    const latest2 = await supplyChain.getLatestPrice('P1')
    expect(latest2).to.equal(150n)

    const history = await supplyChain.getPriceHistory('P1')
    expect(history.length).to.equal(2)
    expect(history[0].price).to.equal(100n)
    expect(history[1].price).to.equal(150n)
  })
})
