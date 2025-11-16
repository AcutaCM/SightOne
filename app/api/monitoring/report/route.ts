import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';
import { logger } from '@/lib/logger/logger';

export async function GET() {
  try {
    const report = performanceMonitor.generateReport();
    
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Failed to generate performance report', { error }, 'MonitoringAPI');
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REPORT_GENERATION_ERROR',
          message: 'Failed to generate performance report',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    performanceMonitor.reset();
    logger.info('Performance metrics reset', {}, 'MonitoringAPI');
    
    return NextResponse.json({
      success: true,
      message: 'Performance metrics reset successfully',
    });
  } catch (error) {
    logger.error('Failed to reset performance metrics', { error }, 'MonitoringAPI');
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RESET_ERROR',
          message: 'Failed to reset performance metrics',
        },
      },
      { status: 500 }
    );
  }
}
