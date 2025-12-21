/**
 * Notification Service
 * Sends email and push notifications for product updates
 */

import prisma from '@/lib/db/prisma'

/**
 * Send notification to watchers when product is updated
 * @param {string} productId - Product ID
 * @param {string} eventType - Type of event (e.g., 'QUALITY_CHECK', 'SHIPPED')
 * @param {Object} eventData - Event details
 */
export async function notifyWatchers(productId, eventType, eventData) {
  try {
    // Get all watchers for this product
    const watchers = await prisma.productWatch.findMany({
      where: {
        productId,
        OR: [
          { notifyEmail: true },
          { notifyPush: true },
        ],
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })

    if (watchers.length === 0) return

    // Send notifications with proper error handling
    const notifications = watchers.map(async (watch) => {
      try {
        const promises = []

        if (watch.notifyEmail) {
          promises.push(
            sendEmailNotification(
              watch.user.email,
              watch.user.name,
              watch.product.name,
              eventType,
              eventData
            ).catch(err => {
              console.error(`Failed to send email to ${watch.user.email}:`, err.message)
              return null
            })
          )
        }

        if (watch.notifyPush) {
          promises.push(
            sendPushNotification(
              watch.userId,
              watch.product.name,
              eventType,
              eventData
            ).catch(err => {
              console.error(`Failed to send push to user ${watch.userId}:`, err.message)
              return null
            })
          )
        }

        return Promise.all(promises)
      } catch (err) {
        console.error('Error processing notification for watcher:', err)
        return null
      }
    })

    // Use allSettled to prevent one failure from blocking others
    await Promise.allSettled(notifications)
    console.log(`Sent ${watchers.length} notifications for product ${productId}`)
  } catch (error) {
    console.error('Failed to notify watchers:', error)
  }
}

/**
 * Send email notification
 * @param {string} email - Recipient email
 * @param {string} userName - Recipient name
 * @param {string} productName - Product name
 * @param {string} eventType - Event type
 * @param {Object} eventData - Event details
 */
async function sendEmailNotification(email, userName, productName, eventType, eventData) {
  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // For now, just log
  console.log(`Email to ${email}:`, {
    subject: `Update: ${productName}`,
    body: `Hi ${userName}, ${productName} has a new event: ${eventType}`,
  })

  // Example using Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'TraceRoot <noreply@traceroot.app>',
    to: email,
    subject: `Update: ${productName}`,
    html: `
      <h2>Product Update</h2>
      <p>Hi ${userName},</p>
      <p>The product <strong>${productName}</strong> has a new event:</p>
      <p><strong>${eventType}</strong></p>
      <p>${eventData.description || ''}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/product/${eventData.productId}">View Product</a>
    `,
  })
  */
}

/**
 * Send push notification
 * @param {string} userId - User ID
 * @param {string} productName - Product name
 * @param {string} eventType - Event type
 * @param {Object} eventData - Event details
 */
async function sendPushNotification(userId, productName, eventType, eventData) {
  // TODO: Integrate with push service (OneSignal, FCM, etc.)
  console.log(`Push to user ${userId}:`, {
    title: `Update: ${productName}`,
    body: `New event: ${eventType}`,
  })

  // Example using Web Push API:
  /*
  const webpush = require('web-push')
  
  // Get user's push subscription from database
  const subscription = await prisma.pushSubscription.findFirst({
    where: { userId }
  })

  if (subscription) {
    await webpush.sendNotification(
      JSON.parse(subscription.subscription),
      JSON.stringify({
        title: `Update: ${productName}`,
        body: `New event: ${eventType}`,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${eventData.productId}`,
      })
    )
  }
  */
}

/**
 * Batch notify watchers for multiple products
 * @param {Array} updates - Array of {productId, eventType, eventData}
 */
export async function batchNotifyWatchers(updates) {
  const notifications = updates.map((update) =>
    notifyWatchers(update.productId, update.eventType, update.eventData)
  )
  await Promise.all(notifications)
}
