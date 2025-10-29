/**
 * QR Code Print Utilities
 * Generate printable QR codes with high error correction
 */

import { QRCodeCanvas } from 'qrcode.react'
import { generateQRToken } from './qr-token'

/**
 * Generate QR code configuration for printing
 * @param {Object} product - Product data
 * @param {string} versionKey - Version identifier
 * @param {string} baseUrl - App base URL
 * @returns {Promise<Object>} QR config
 */
export async function generatePrintQRConfig(product, versionKey, baseUrl) {
  const token = await generateQRToken({
    productId: product.id,
    version: versionKey,
    name: product.name,
    category: product.category,
  })

  const url = new URL(`/verify/${product.id}`, baseUrl)
  url.searchParams.set('t', token)
  url.searchParams.set('v', versionKey)

  return {
    value: url.toString(),
    size: 512, // High resolution for print
    level: 'H', // Highest error correction (30%)
    includeMargin: true,
    bgColor: '#ffffff',
    fgColor: '#000000',
  }
}

/**
 * Generate QR code as data URL for download/print
 * @param {Object} config - QR config from generatePrintQRConfig
 * @returns {Promise<string>} Data URL
 */
export async function generateQRDataURL(config) {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size
      canvas.width = config.size
      canvas.height = config.size

      // Create QR code using qrcode library
      const QRCode = require('qrcode')
      QRCode.toCanvas(
        canvas,
        config.value,
        {
          errorCorrectionLevel: config.level,
          margin: config.includeMargin ? 4 : 0,
          width: config.size,
          color: {
            dark: config.fgColor,
            light: config.bgColor,
          },
        },
        (error) => {
          if (error) {
            reject(error)
          } else {
            resolve(canvas.toDataURL('image/png'))
          }
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate PDF with QR codes for batch printing
 * @param {Array} products - Array of products with QR configs
 * @returns {Promise<Blob>} PDF blob
 */
export async function generateQRPDF(products) {
  // This would require a PDF library like jsPDF
  // Placeholder for now
  throw new Error('PDF generation not yet implemented. Use individual PNG downloads.')
}

/**
 * Download QR code as PNG
 * @param {string} dataURL - QR code data URL
 * @param {string} filename - Download filename
 */
export function downloadQRImage(dataURL, filename) {
  const link = document.createElement('a')
  link.href = dataURL
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
