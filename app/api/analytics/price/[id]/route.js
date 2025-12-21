import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

function err(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function calculateStats(priceRecords) {
  if (!priceRecords.length) {
    return {
      currentPrice: 0,
      avgPrice: 0,
      maxPrice: 0,
      minPrice: 0,
      volatility: 0,
      dataPoints: 0
    };
  }

  const prices = priceRecords.map(r => Number(r.price || r.newPrice || 0));
  const current = prices[prices.length - 1];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  
  // Simple volatility: std dev
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const volatility = avg > 0 ? stdDev / avg : 0;

  const maxIdx = prices.indexOf(max);
  const minIdx = prices.indexOf(min);

  return {
    currentPrice: current,
    previousPrice: prices.length > 1 ? prices[prices.length - 2] : current,
    avgPrice: avg,
    maxPrice: max,
    minPrice: min,
    maxDate: priceRecords[maxIdx]?.timestamp,
    minDate: priceRecords[minIdx]?.timestamp,
    volatility,
    dataPoints: prices.length
  };
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const rangeParam = request.nextUrl.searchParams.get('range') || '30d';

    // Parse date range
    const now = new Date();
    let startDate = new Date();

    switch (rangeParam) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(2000, 0, 1); // Far past
        break;
      case '30d':
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get price history from audit logs
    const logs = await prisma.auditLog.findMany({
      where: {
        type: 'PRICE_INDEXED',
        productId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    });

    const priceRecords = logs.map(log => {
      let extra = {}
      try {
        extra = JSON.parse(log.extra || '{}')
      } catch (parseError) {
        console.error('Failed to parse audit log extra data:', parseError)
      }
      return {
        price: extra.newPrice || 0,
        newPrice: extra.newPrice || 0,
        timestamp: log.timestamp,
        actor: extra.actor || 'unknown'
      }
    })

    const stats = calculateStats(priceRecords);

    return ok({
      productId,
      range: rangeParam,
      startDate,
      endDate: now,
      ...stats
    });
  } catch (error) {
    console.error('GET /api/analytics/price/[id] error:', error);
    return err('Server error', 500);
  }
}
