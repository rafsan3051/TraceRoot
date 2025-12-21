/**
 * Price Notification Service
 * Sends alerts to users watching products when price changes
 */

import prisma from '@/lib/prisma';

export async function notifyPriceChange(productId, oldPrice, newPrice, product) {
  try {
    const watchers = await prisma.productWatch.findMany({
      where: { productId, notifyPrice: true },
      include: { user: { select: { id: true, email: true, name: true } } }
    });

    if (watchers.length === 0) {
      console.log(`ℹ️  No watchers to notify for product ${productId}`);
      return;
    }

    const priceChange = Number(newPrice) - Number(oldPrice);
    const percentChange = ((priceChange / Number(oldPrice)) * 100).toFixed(2);
    const direction = priceChange > 0 ? '📈 increased' : priceChange < 0 ? '📉 decreased' : 'unchanged';

    const message = `
Price ${direction}!
Product: ${product?.name || productId}
Old Price: ${oldPrice}
New Price: ${newPrice}
Change: ${Math.abs(priceChange).toFixed(2)} (${percentChange}%)
    `.trim();

    for (const watcher of watchers) {
      try {
        // Log notification record
        await prisma.auditLog.create({
          data: {
            type: 'PRICE_NOTIFICATION_SENT',
            message,
            userId: watcher.user.id,
            productId
          }
        });

        console.log(`📧 Price notification sent to ${watcher.user.email}`);
        
        // TODO: Integrate with email service (Resend, SendGrid, etc.)
        // sendEmail({
        //   to: watcher.user.email,
        //   subject: `Price Alert: ${product?.name} - ${direction}`,
        //   text: message
        // });
      } catch (err) {
        console.error(`Failed to notify ${watcher.user.email}:`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ Failed to send price notifications:', error.message);
  }
}

/**
 * Get notification preferences for a user
 */
export async function getUserNotificationPreferences(userId) {
  try {
    const watches = await prisma.productWatch.findMany({
      where: { userId },
      include: { product: { select: { id: true, name: true, price: true } } }
    });

    return watches.map(w => ({
      productId: w.productId,
      productName: w.product.name,
      notifyPrice: w.notifyPrice,
      priceThreshold: w.priceThreshold || null
    }));
  } catch (error) {
    console.error('❌ Failed to get notification preferences:', error.message);
    return [];
  }
}

/**
 * Update notification preference for a watched product
 */
export async function updateNotificationPreference(userId, productId, notifyPrice, priceThreshold) {
  try {
    const watch = await prisma.productWatch.findFirst({
      where: { userId, productId }
    });

    if (!watch) {
      throw new Error('Product not in watchlist');
    }

    await prisma.productWatch.update({
      where: { id: watch.id },
      data: {
        notifyPrice,
        priceThreshold: priceThreshold ? Number(priceThreshold) : null
      }
    });

    console.log(`✅ Updated notification preference for ${productId}`);
  } catch (error) {
    console.error('❌ Failed to update notification preference:', error.message);
    throw error;
  }
}
