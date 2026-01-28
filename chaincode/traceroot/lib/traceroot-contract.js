'use strict';

const { Contract } = require('fabric-contract-api');

class TraceRootContract extends Contract {
  async initLedger(ctx) {
    console.info("🚀 TraceRoot chaincode initialized");
  }

  async RegisterProduct(ctx, productId, name, origin, category, manufacturer, mfgDate, expiryDate, dataJson) {
    const exists = await this._assetExists(ctx, productId);
    if (exists) {
      throw new Error(`Product ${productId} already exists`);
    }

    const data = dataJson ? JSON.parse(dataJson) : {};

    const product = {
      productId,
      name,
      origin,
      category,
      manufacturer,
      mfgDate,
      expiryDate,
      data,
      owner: data.owner || "Org1MSP",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [],
    };

    await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
    return productId;
  }

  async RecordEvent(ctx, productId, eventType, location, dataJson) {
    const product = await this._getProduct(ctx, productId);

    const event = {
      eventType,
      location,
      data: dataJson ? JSON.parse(dataJson) : {},
      timestamp: new Date().toISOString(),
    };

    product.events.push(event);
    product.updatedAt = new Date().toISOString();

    await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
    return JSON.stringify(event);
  }

  async GetProduct(ctx, productId) {
    const product = await this._getProduct(ctx, productId);
    return JSON.stringify(product);
  }

  async GetProductHistory(ctx, productId) {
    const iterator = await ctx.stub.getHistoryForKey(productId);
    const history = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value) {
        const val = res.value.value.toString("utf8");
        try {
          history.push(JSON.parse(val));
        } catch (e) {
          history.push(val);
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(history);
  }

  async TransferOwnership(ctx, productId, newOwner) {
    const product = await this._getProduct(ctx, productId);
    product.owner = newOwner;
    product.updatedAt = new Date().toISOString();

    await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
    return JSON.stringify({ productId, newOwner });
  }

  async _getProduct(ctx, productId) {
    const buffer = await ctx.stub.getState(productId);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Product ${productId} does not exist`);
    }
    try {
      return JSON.parse(buffer.toString());
    } catch (e) {
      throw new Error(`Corrupted product state for ${productId}`);
    }
  }

  async _assetExists(ctx, id) {
    const buffer = await ctx.stub.getState(id);
    return !!buffer && buffer.length > 0;
  }
}

module.exports = TraceRootContract;
module.exports.TraceRootContract = TraceRootContract;
