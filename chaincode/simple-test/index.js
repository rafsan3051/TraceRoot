'use strict';

const { Contract } = require('fabric-contract-api');

class SimpleContract extends Contract {
    
    async ping(ctx) {
        return JSON.stringify({ message: 'pong', timestamp: new Date().toISOString() });
    }

    async echo(ctx, message) {
        return JSON.stringify({ echo: message, timestamp: new Date().toISOString() });
    }

    async getValue(ctx, key) {
        const valueBytes = await ctx.stub.getState(key);
        if (!valueBytes || valueBytes.length === 0) {
            throw new Error(`Key ${key} does not exist`);
        }
        return valueBytes.toString();
    }

    async setValue(ctx, key, value) {
        await ctx.stub.putState(key, Buffer.from(value));
        return JSON.stringify({ key, value, timestamp: new Date().toISOString() });
    }
}

module.exports = SimpleContract;
