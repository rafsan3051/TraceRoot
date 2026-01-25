// Replit Health Check Endpoint
// Add this to your app/api/health/route.js

import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      api: {
        message: 'TraceRoot API is running',
        version: '0.1.0',
      },
      fabric: {
        message: 'Check Fabric network status via /api/fabric endpoints',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
