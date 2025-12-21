/*
 * TraceRoot Price Chaincode
 * Hyperledger Fabric chaincode for append-only price history
 * Mirrors Ethereum price updates for dual-ledger audit trail
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class PriceContract extends Contract {
  /**
   * Record a price update (mirrors Ethereum updatePrice event)
   */
  async recordPriceUpdate(ctx, productId, newPrice, previousPrice, notes, actor, txHash) {
    const timestamp = new Date().toISOString();
    const key = `PRICE_${productId}_${timestamp}`;

    const priceRecord = {
      productId,
      newPrice: parseFloat(newPrice),
      previousPrice: parseFloat(previousPrice),
      notes,
      actor,
      txHash,
      timestamp,
      ledger: 'fabric'
    };

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(priceRecord)));

    // Also update a composite key for easier querying
    const compositeKey = ctx.stub.createCompositeKey('PRODUCT_PRICES', [productId, timestamp]);
    await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(priceRecord)));

    // Emit event for subscribers
    ctx.stub.setEvent('PriceRecorded', Buffer.from(JSON.stringify({
      productId,
      newPrice,
      previousPrice,
      timestamp,
      actor
    })));

    return key;
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(ctx, productId) {
    const iterator = await ctx.stub.getStateByPartialCompositeKey('PRODUCT_PRICES', [productId]);
    
    const history = [];
    let result = await iterator.next();
    
    while (!result.done) {
      if (result.value && result.value.value.length > 0) {
        const record = JSON.parse(result.value.value.toString());
        history.push(record);
      }
      result = await iterator.next();
    }

    await iterator.close();
    return history;
  }

  /**
   * Get latest price for a product
   */
  async getLatestPrice(ctx, productId) {
    const history = await this.getPriceHistory(ctx, productId);
    if (history.length === 0) {
      return { productId, price: 0, timestamp: null };
    }
    
    const latest = history[history.length - 1];
    return {
      productId,
      price: latest.newPrice,
      timestamp: latest.timestamp,
      actor: latest.actor
    };
  }

  /**
   * Get price history between dates
   */
  async getPriceHistoryByDateRange(ctx, productId, startDate, endDate) {
    const history = await this.getPriceHistory(ctx, productId);
    
    return history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
  }

  /**
   * Calculate average price over a period
   */
  async getAveragePriceInPeriod(ctx, productId, startDate, endDate) {
    const history = await this.getPriceHistoryByDateRange(ctx, productId, startDate, endDate);
    
    if (history.length === 0) {
      return { productId, average: 0, count: 0 };
    }

    const sum = history.reduce((acc, record) => acc + record.newPrice, 0);
    return {
      productId,
      average: sum / history.length,
      count: history.length,
      startDate,
      endDate
    };
  }
}

module.exports = PriceContract;
