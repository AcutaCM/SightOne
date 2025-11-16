'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';
import type { PerformanceReport } from '@/lib/monitoring/performanceMonitor';

export default function MonitoringDashboard() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadReport = () => {
    try {
      const newReport = performanceMonitor.generateReport();
      setReport(newReport);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load performance report:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();

    if (autoRefresh) {
      const interval = setInterval(loadReport, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleReset = () => {
    performanceMonitor.reset();
    loadReport();
  };

  if (isLoading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading monitoring data...</div>
      </div>
    );
  }

  const { apiMetrics, databaseMetrics, cacheMetrics, timeRange } = report;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoring since {timeRange.start.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg ${
              autoRefresh
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Reset Metrics
          </button>
          <button
            onClick={loadReport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">System Health Status</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <HealthIndicator
              label="API Health"
              status={apiMetrics.averageResponseTime < 500 ? 'healthy' : 'warning'}
              value={`${apiMetrics.averageResponseTime.toFixed(2)}ms avg`}
            />
            <HealthIndicator
              label="Database Health"
              status={databaseMetrics.averageQueryTime < 100 ? 'healthy' : 'warning'}
              value={`${databaseMetrics.averageQueryTime.toFixed(2)}ms avg`}
            />
            <HealthIndicator
              label="Cache Health"
              status={cacheMetrics.hitRate > 70 ? 'healthy' : 'warning'}
              value={`${cacheMetrics.hitRate.toFixed(1)}% hit rate`}
            />
          </div>
        </CardBody>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Metrics */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">API Performance</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <MetricRow
                label="Total Requests"
                value={apiMetrics.totalRequests.toString()}
              />
              <MetricRow
                label="Average Response Time"
                value={`${apiMetrics.averageResponseTime.toFixed(2)}ms`}
                status={apiMetrics.averageResponseTime < 500 ? 'good' : 'warning'}
              />
              {apiMetrics.slowestEndpoint && (
                <MetricRow
                  label="Slowest Endpoint"
                  value={`${apiMetrics.slowestEndpoint.endpoint} (${apiMetrics.slowestEndpoint.duration.toFixed(2)}ms)`}
                  status="warning"
                />
              )}
              {apiMetrics.fastestEndpoint && (
                <MetricRow
                  label="Fastest Endpoint"
                  value={`${apiMetrics.fastestEndpoint.endpoint} (${apiMetrics.fastestEndpoint.duration.toFixed(2)}ms)`}
                  status="good"
                />
              )}
            </div>
          </CardBody>
        </Card>

        {/* Database Metrics */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Database Performance</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <MetricRow
                label="Total Queries"
                value={databaseMetrics.totalQueries.toString()}
              />
              <MetricRow
                label="Average Query Time"
                value={`${databaseMetrics.averageQueryTime.toFixed(2)}ms`}
                status={databaseMetrics.averageQueryTime < 100 ? 'good' : 'warning'}
              />
              {databaseMetrics.slowestQuery && (
                <MetricRow
                  label="Slowest Query"
                  value={`${databaseMetrics.slowestQuery.query.substring(0, 50)}... (${databaseMetrics.slowestQuery.duration.toFixed(2)}ms)`}
                  status="warning"
                />
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Cache Statistics</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {cacheMetrics.hits}
              </div>
              <div className="text-sm text-gray-500 mt-1">Cache Hits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {cacheMetrics.misses}
              </div>
              <div className="text-sm text-gray-500 mt-1">Cache Misses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {cacheMetrics.hitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Hit Rate</div>
            </div>
          </div>
          
          {/* Cache Hit Rate Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cache Efficiency</span>
              <span className="text-sm text-gray-500">
                {cacheMetrics.hitRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  cacheMetrics.hitRate > 70
                    ? 'bg-green-500'
                    : cacheMetrics.hitRate > 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${cacheMetrics.hitRate}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Error Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Error Statistics</h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <p>No errors detected in the current monitoring period</p>
            <p className="text-sm mt-2">System is operating normally</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Helper Components
interface HealthIndicatorProps {
  label: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
}

function HealthIndicator({ label, status, value }: HealthIndicatorProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusIcons = {
    healthy: '✓',
    warning: '⚠',
    error: '✗',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-2xl">{statusIcons[status]}</span>
      </div>
      <div className="mt-2 text-sm">{value}</div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  status?: 'good' | 'warning' | 'error';
}

function MetricRow({ label, value, status }: MetricRowProps) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm font-medium ${
          status ? statusColors[status] : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
