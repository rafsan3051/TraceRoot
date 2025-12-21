'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function PriceAnalyticsDashboard({ productId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/price/${productId}?range=${timeRange}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-red-500">Failed to load analytics</div>;
  }

  const avgPrice = analytics.avgPrice || 0;
  const maxPrice = analytics.maxPrice || 0;
  const minPrice = analytics.minPrice || 0;
  const currentPrice = analytics.currentPrice || 0;
  const priceChange = currentPrice - (analytics.previousPrice || currentPrice);
  const isIncreasing = priceChange >= 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">Price Analytics</h2>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['7d', '30d', '90d', 'all'].map(range => (
          <button
            key={range}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === range
                ? 'bg-emerald-600 text-white'
                : 'border text-muted-foreground hover:bg-secondary'
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range === 'all' ? 'All' : range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Current Price */}
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Current Price</p>
          <p className="text-2xl font-bold">{currentPrice.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs">
            {isIncreasing ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={isIncreasing ? 'text-emerald-600' : 'text-red-600'}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Average Price */}
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="text-2xl font-bold">{avgPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {analytics.dataPoints || 0} records
          </p>
        </div>

        {/* Highest Price */}
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Highest</p>
          <p className="text-2xl font-bold">{maxPrice.toFixed(2)}</p>
          {analytics.maxDate && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(analytics.maxDate), 'MMM d')}
            </p>
          )}
        </div>

        {/* Lowest Price */}
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Lowest</p>
          <p className="text-2xl font-bold">{minPrice.toFixed(2)}</p>
          {analytics.minDate && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(analytics.minDate), 'MMM d')}
            </p>
          )}
        </div>
      </div>

      {/* Simple Trend Chart Placeholder */}
      <div className="border rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold">Price Trend</h3>
        <div className="h-32 bg-muted rounded flex items-center justify-center">
          <span className="text-xs text-muted-foreground">
            Chart integration available via Chart.js or Recharts
          </span>
        </div>
      </div>

      {/* Statistics */}
      {analytics.volatility != null && (
        <div className="border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold">Statistics</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Price Range</dt>
              <dd>{(maxPrice - minPrice).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Volatility</dt>
              <dd>{(analytics.volatility * 100).toFixed(2)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Updates (period)</dt>
              <dd>{analytics.dataPoints || 0}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
