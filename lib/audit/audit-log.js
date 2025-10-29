/**
 * Audit logging utility
 * Records user actions for security and compliance
 */

import prisma from '@/lib/db/prisma'

/**
 * Log an audit event
 * @param {Object} params
 * @param {string?} params.userId - User ID (optional for public actions)
 * @param {string} params.action - Action performed (CREATE, UPDATE, DELETE, VIEW, etc.)
 * @param {string} params.entityType - Type of entity (Product, Event, User, etc.)
 * @param {string} params.entityId - ID of the entity
 * @param {Object?} params.changes - JSON object with before/after values
 * @param {string?} params.ipAddress - Client IP
 * @param {string?} params.userAgent - Client user agent
 */
export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  changes,
  ipAddress,
  userAgent,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
        ipAddress: ipAddress?.substring(0, 45), // Limit length
        userAgent: userAgent?.substring(0, 255), // Limit length
      },
    })
  } catch (error) {
    // Don't throw - audit failures shouldn't break the app
    console.error('Audit log failed:', error)
  }
}

/**
 * Extract audit metadata from request
 * @param {Request} request - Next.js request
 * @returns {Object} { ipAddress, userAgent }
 */
export function getAuditMetadata(request) {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return { ipAddress, userAgent }
}

/**
 * Query audit logs
 * @param {Object} filters
 * @returns {Promise<Array>} Audit log entries
 */
export async function queryAuditLogs(filters = {}) {
  const where = {}

  if (filters.userId) where.userId = filters.userId
  if (filters.action) where.action = filters.action
  if (filters.entityType) where.entityType = filters.entityType
  if (filters.entityId) where.entityId = filters.entityId

  if (filters.startDate || filters.endDate) {
    where.timestamp = {}
    if (filters.startDate) where.timestamp.gte = new Date(filters.startDate)
    if (filters.endDate) where.timestamp.lte = new Date(filters.endDate)
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: filters.limit || 100,
  })

  return logs
}
