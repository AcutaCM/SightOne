/**
 * QR Scan API Endpoint
 * Handles enhanced QR code detection requests
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      timeout = 10,
      scan_region = { type: 'full' },
      multi_detection = false,
      max_detections = 5,
      validation_rules = {},
      parse_format = 'auto',
      aggregate_results = true,
      draw_annotations = true,
      save_image = true,
    } = body;

    // Send request to Python backend via WebSocket or HTTP
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8765';
    
    const response = await fetch(`${backendUrl}/api/qr/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeout,
        scan_region,
        multi_detection,
        max_detections,
        validation_rules,
        parse_format,
        aggregate_results,
        draw_annotations,
        save_image,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('QR scan API error:', error);
    return NextResponse.json(
      {
        success: false,
        detections: [],
        count: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
