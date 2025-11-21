'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ConfigurationCheck({ children }) {
  const [configStatus, setConfigStatus] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkConfiguration()
    
    // Fallback: if check takes too long, assume it's configured
    const timeout = setTimeout(() => {
      if (checking) {
        console.log('Config check timed out, assuming configured')
        setConfigStatus({ configured: true })
        setChecking(false)
      }
    }, 3000) // 3 second timeout
    
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkConfiguration = async () => {
    try {
      const res = await fetch('/api/health', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!res.ok) {
        // If health check fails, assume there's a config issue
        const data = await res.json().catch(() => ({}))
        setConfigStatus({
          status: 'error',
          configured: false,
          message: data.message || 'Configuration check failed',
          missing: data.missing || []
        })
      } else {
        const data = await res.json()
        setConfigStatus(data)
      }
    } catch (error) {
      console.error('Config check failed:', error)
      // On error, assume it's configured and let the app handle errors
      setConfigStatus({
        status: 'ok',
        configured: true
      })
    } finally {
      setChecking(false)
    }
  }

  // If still checking, show loading
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    )
  }

  // If not configured, show error page
  if (configStatus && !configStatus.configured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <div className="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
              Configuration Required
            </h1>
            <p className="text-lg text-muted-foreground">
              The application needs to be configured before it can run
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-red-800 dark:text-red-200 flex items-center gap-2">
              <span className="text-2xl">❌</span>
              Missing Environment Variables
            </h2>
            
            {configStatus.missing && configStatus.missing.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  The following variables are required:
                </p>
                <ul className="space-y-2">
                  {configStatus.missing.map((variable, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <code className="bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded text-sm font-mono text-red-800 dark:text-red-200">
                        {variable}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              How to Fix This
            </h2>
            
            <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex gap-3">
                <span className="font-bold min-w-6">1.</span>
                <span>Go to your <strong>Vercel Dashboard</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold min-w-6">2.</span>
                <span>Select your project and navigate to <strong>Settings → Environment Variables</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold min-w-6">3.</span>
                <span>Add the required variables (see deployment guide for values)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold min-w-6">4.</span>
                <span>Go to <strong>Deployments</strong> tab and click <strong>Redeploy</strong></span>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Need Help?
            </h3>
            <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <p>
                <strong>For MongoDB:</strong> Create a free cluster at{' '}
                <a 
                  href="https://www.mongodb.com/cloud/atlas/register" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-600"
                >
                  MongoDB Atlas
                </a>
              </p>
              <p>
                <strong>For JWT_SECRET:</strong> Generate a random string using:{' '}
                <code className="bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded font-mono text-xs">
                  openssl rand -hex 32
                </code>
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => checkConfiguration()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🔄 Recheck Configuration
            </button>
            <a
              href="https://github.com/rafsan3051/TraceRoot/blob/main/VERCEL_DEPLOYMENT.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              📖 Deployment Guide
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Configuration is OK, render the app
  return children
}
