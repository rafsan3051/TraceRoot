/**
 * Email service for TraceRoot
 * Supports Resend (production) and console logging (development)
 */

// For production, install: npm install resend
// Then set RESEND_API_KEY in .env

const isDev = process.env.NODE_ENV === 'development'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@traceroot.com'

/**
 * Send password reset email
 * @param {string} email - User email address
 * @param {string} token - Reset token
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${APP_URL}/auth/reset?token=${token}`
  
  const subject = 'Reset Your TraceRoot Password'
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TraceRoot Password Reset</h1>
        </div>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>Or copy this link: <code>${resetLink}</code></p>
        <p style="color: #888; font-size: 12px;">This link will expire in 1 hour.</p>
        <div class="footer">
            <p>If you didn't request this, please ignore this email.</p>
            <p>&copy; 2024 TraceRoot. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `

  const textContent = `
Password Reset Request

Hello,

We received a request to reset your password. Visit this link to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

TraceRoot Team
  `

  try {
    // Development: Log to console
    if (isDev || !RESEND_API_KEY) {
      console.log('📧 [DEV EMAIL] Password Reset Email')
      console.log(`To: ${email}`)
      console.log(`Subject: ${subject}`)
      console.log(`Reset Link: ${resetLink}`)
      console.log('---')
      return { success: true }
    }

    // Production: Use Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return { success: false, error: 'Failed to send email' }
    }

    console.log(`✅ Password reset email sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email verification
 * @param {string} email - User email address
 * @param {string} verificationLink - Full verification link
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendVerificationEmail(email, verificationLink) {
  const subject = 'Verify Your TraceRoot Account'
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .button { background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to TraceRoot</h1>
        </div>
        <p>Thank you for creating an account! Please verify your email address.</p>
        <a href="${verificationLink}" class="button">Verify Email</a>
        <p style="color: #888; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
</body>
</html>
  `

  try {
    if (isDev || !RESEND_API_KEY) {
      console.log('📧 [DEV EMAIL] Verification Email')
      console.log(`To: ${email}`)
      console.log(`Verification Link: ${verificationLink}`)
      return { success: true }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return { success: false, error: 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send account welcome email
 * @param {string} email - User email address
 * @param {string} name - User name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to TraceRoot!'
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to TraceRoot, ${name || 'User'}!</h1>
        </div>
        <p>Your account has been successfully created. You can now log in and access all features.</p>
        <p>Happy tracking!</p>
        <p>&copy; 2024 TraceRoot. All rights reserved.</p>
    </div>
</body>
</html>
  `

  try {
    if (isDev || !RESEND_API_KEY) {
      console.log('📧 [DEV EMAIL] Welcome Email')
      console.log(`To: ${email}`)
      return { success: true }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return { success: false, error: 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: error.message }
  }
}
/**
 * Send PIN for password reset
 */
export async function sendPasswordResetPIN(email, pin, expiryMinutes = 10) {
  const subject = 'Your TraceRoot Password Reset PIN'
  const htmlContent = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;color:#333;line-height:1.6}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#f8f9fa;padding:20px;border-radius:5px;text-align:center}.pin-box{background-color:#007bff;color:white;font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px;text-align:center;border-radius:8px;margin:30px 0}.warning{background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0}.footer{font-size:12px;color:#666;margin-top:30px;border-top:1px solid #ddd;padding-top:20px}</style></head><body><div class="container"><div class="header"><h1>🔐 Password Reset PIN</h1></div><p>Hello,</p><p>We received a request to reset your password. Use the PIN below to verify your identity:</p><div class="pin-box">${'${pin}'}</div><div class="warning"><strong>⏱️ This PIN will expire in ${'${expiryMinutes}'} minutes</strong><br><small>You have 5 attempts to enter the correct PIN</small></div><p>If you didn't request this, please ignore this email.</p><div class="footer"><p><strong>Security Tips:</strong></p><ul style="font-size:12px"><li>Never share your PIN with anyone</li><li>TraceRoot will never ask for your PIN via phone or email</li></ul><p>&copy; 2025 TraceRoot. All rights reserved.</p></div></div></body></html>`
  try {
    if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
      console.log('📧 [DEV EMAIL] Password Reset PIN')
      console.log(`To: ${'${email}'}`)
      console.log(`PIN: ${'${pin}'}`)
      console.log(`Expires in: ${'${expiryMinutes}'} minutes`)
      console.log('---')
      return { success: true }
    }
    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send PIN for email verification
 */
export async function sendEmailVerificationPIN(email, pin, expiryMinutes = 10) {
  const subject = 'Verify Your TraceRoot Account'
  const htmlContent = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;color:#333;line-height:1.6}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#28a745;color:white;padding:20px;border-radius:5px;text-align:center}.pin-box{background-color:#28a745;color:white;font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px;text-align:center;border-radius:8px;margin:30px 0}.info{background-color:#d1ecf1;border-left:4px solid #0c5460;padding:15px;margin:20px 0}.footer{font-size:12px;color:#666;margin-top:30px;border-top:1px solid #ddd;padding-top:20px}</style></head><body><div class="container"><div class="header"><h1>✉️ Welcome to TraceRoot!</h1></div><p>Hello,</p><p>Thank you for creating an account. Please verify your email using the PIN below:</p><div class="pin-box">${'${pin}'}</div><div class="info"><strong>⏱️ This PIN will expire in ${'${expiryMinutes}'} minutes</strong><br><small>You have 5 attempts to enter the correct PIN</small></div><p>Enter this PIN to activate your account.</p><div class="footer"><p>If you didn't create this account, please ignore this email.</p><p>&copy; 2025 TraceRoot. All rights reserved.</p></div></div></body></html>`
  try {
    if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
      console.log('📧 [DEV EMAIL] Email Verification PIN')
      console.log(`To: ${'${email}'}`)
      console.log(`PIN: ${'${pin}'}`)
      console.log(`Expires in: ${'${expiryMinutes}'} minutes`)
      console.log('---')
      return { success: true }
    }
    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: error.message }
  }
}
