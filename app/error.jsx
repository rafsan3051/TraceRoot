'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  // Check if it's a database connection error
  const isDatabaseError = error.message?.includes('DATABASE_URL') || 
                          error.message?.includes('MongoDB')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-red-500">
            {isDatabaseError ? '⚙️ Configuration Error' : '❌ Something went wrong'}
          </h1>
          
          {isDatabaseError ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                The application is not properly configured.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-left">
                <h2 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Missing Environment Variables
                </h2>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  The following environment variables need to be set:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-red-700 dark:text-red-300">
                  <li><code className="bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">DATABASE_URL</code> - MongoDB connection string</li>
                  <li><code className="bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">JWT_SECRET</code> - Secret key for authentication</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 font-semibold mb-2">
                    How to fix this:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li>Go to your Vercel Dashboard</li>
                    <li>Navigate to: Project Settings → Environment Variables</li>
                    <li>Add the required variables</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                An unexpected error occurred while processing your request.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
                  {error.message || 'Unknown error'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Need help?{' '}
            <a
              href="https://github.com/rafsan3051/TraceRoot/blob/main/VERCEL_DEPLOYMENT.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Check the deployment guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
