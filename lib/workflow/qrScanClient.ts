/**
 * QR Scan Client for Workflow Integration
 * Provides enhanced QR code detection with validation and multi-detection support
 */

export interface QRScanRegion {
  type: 'full' | 'center' | 'top' | 'bottom' | 'custom';
  customRegion?: { x: number; y: number; width: number; height: number };
}

export interface QRValidationRules {
  pattern?: string;
  requiredPrefix?: string;
  minLength?: number;
  maxLength?: number;
}

export interface QRScanOptions {
  timeout?: number;
  scanRegion?: QRScanRegion;
  multiDetection?: boolean;
  maxDetections?: number;
  validationRules?: QRValidationRules;
  parseFormat?: 'auto' | 'json' | 'url' | 'keyvalue' | 'text';
  aggregateResults?: boolean;
  drawAnnotations?: boolean;
  saveImage?: boolean;
}

export interface QRDetectionResult {
  data: string;
  type: string;
  bbox: [number, number, number, number];
  center: [number, number];
  plant_id?: number;
  timestamp: string;
  parsed?: any;
  valid: boolean;
  validationErrors?: string[];
}

export interface QRScanResult {
  success: boolean;
  detections: QRDetectionResult[];
  count: number;
  image?: string;
  timestamp: string;
  error?: string;
}

class QRScanClient {
  private wsUrl: string;
  private connected: boolean = false;

  constructor(wsUrl: string = 'ws://localhost:8765') {
    this.wsUrl = wsUrl;
  }

  /**
   * Scan for QR codes with enhanced options
   */
  async scan(options: QRScanOptions = {}): Promise<QRScanResult> {
    try {
      const response = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeout: options.timeout || 10,
          scan_region: this.formatScanRegion(options.scanRegion),
          multi_detection: options.multiDetection || false,
          max_detections: options.maxDetections || 5,
          validation_rules: options.validationRules || {},
          parse_format: options.parseFormat || 'auto',
          aggregate_results: options.aggregateResults !== false,
          draw_annotations: options.drawAnnotations !== false,
          save_image: options.saveImage !== false,
        }),
      });

      if (!response.ok) {
        throw new Error(`QR scan failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Validate and parse results
      if (result.success && result.detections) {
        result.detections = result.detections.map((detection: any) => 
          this.processDetection(detection, options)
        );
      }

      return result;
    } catch (error) {
      console.error('QR scan error:', error);
      return {
        success: false,
        detections: [],
        count: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process and validate a single QR detection
   */
  private processDetection(
    detection: any,
    options: QRScanOptions
  ): QRDetectionResult {
    const result: QRDetectionResult = {
      data: detection.data,
      type: detection.type,
      bbox: detection.bbox,
      center: detection.center,
      plant_id: detection.plant_id,
      timestamp: detection.timestamp,
      valid: true,
      validationErrors: [],
    };

    // Validate content
    if (options.validationRules) {
      const errors = this.validateContent(detection.data, options.validationRules);
      if (errors.length > 0) {
        result.valid = false;
        result.validationErrors = errors;
      }
    }

    // Parse content
    if (result.valid && options.parseFormat) {
      result.parsed = this.parseContent(detection.data, options.parseFormat);
    }

    return result;
  }

  /**
   * Validate QR code content against rules
   */
  private validateContent(
    content: string,
    rules: QRValidationRules
  ): string[] {
    const errors: string[] = [];

    // Pattern validation
    if (rules.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(content)) {
          errors.push(`Content does not match pattern: ${rules.pattern}`);
        }
      } catch (e) {
        errors.push(`Invalid regex pattern: ${rules.pattern}`);
      }
    }

    // Prefix validation
    if (rules.requiredPrefix && !content.startsWith(rules.requiredPrefix)) {
      errors.push(`Content must start with: ${rules.requiredPrefix}`);
    }

    // Length validation
    if (rules.minLength && content.length < rules.minLength) {
      errors.push(`Content too short (min: ${rules.minLength})`);
    }

    if (rules.maxLength && rules.maxLength > 0 && content.length > rules.maxLength) {
      errors.push(`Content too long (max: ${rules.maxLength})`);
    }

    return errors;
  }

  /**
   * Parse QR code content based on format
   */
  private parseContent(content: string, format: string): any {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(content);

        case 'url':
          try {
            const url = new URL(content);
            return {
              protocol: url.protocol,
              host: url.host,
              pathname: url.pathname,
              search: url.search,
              hash: url.hash,
              params: Object.fromEntries(url.searchParams),
            };
          } catch {
            return { raw: content, error: 'Invalid URL' };
          }

        case 'keyvalue':
          const pairs: Record<string, string> = {};
          content.split(/[&;,]/).forEach(pair => {
            const [key, value] = pair.split(/[=:]/);
            if (key && value) {
              pairs[key.trim()] = value.trim();
            }
          });
          return pairs;

        case 'auto':
          // Try JSON first
          try {
            return JSON.parse(content);
          } catch {}

          // Try URL
          try {
            const url = new URL(content);
            return {
              type: 'url',
              protocol: url.protocol,
              host: url.host,
              pathname: url.pathname,
              params: Object.fromEntries(url.searchParams),
            };
          } catch {}

          // Try key-value pairs
          if (content.includes('=') || content.includes(':')) {
            const pairs: Record<string, string> = {};
            content.split(/[&;,]/).forEach(pair => {
              const [key, value] = pair.split(/[=:]/);
              if (key && value) {
                pairs[key.trim()] = value.trim();
              }
            });
            if (Object.keys(pairs).length > 0) {
              return { type: 'keyvalue', data: pairs };
            }
          }

          // Return as text
          return { type: 'text', data: content };

        case 'text':
        default:
          return content;
      }
    } catch (error) {
      return {
        raw: content,
        error: error instanceof Error ? error.message : 'Parse error',
      };
    }
  }

  /**
   * Format scan region for backend
   */
  private formatScanRegion(region?: QRScanRegion): any {
    if (!region) {
      return { type: 'full' };
    }

    if (region.type === 'custom' && region.customRegion) {
      return {
        type: 'custom',
        x: region.customRegion.x,
        y: region.customRegion.y,
        width: region.customRegion.width,
        height: region.customRegion.height,
      };
    }

    return { type: region.type };
  }

  /**
   * Aggregate multiple QR detection results
   */
  aggregateResults(detections: QRDetectionResult[]): {
    total: number;
    valid: number;
    invalid: number;
    byType: Record<string, number>;
    plantIds: number[];
    allData: string[];
  } {
    const aggregated = {
      total: detections.length,
      valid: detections.filter(d => d.valid).length,
      invalid: detections.filter(d => !d.valid).length,
      byType: {} as Record<string, number>,
      plantIds: [] as number[],
      allData: [] as string[],
    };

    detections.forEach(detection => {
      // Count by type
      aggregated.byType[detection.type] = 
        (aggregated.byType[detection.type] || 0) + 1;

      // Collect plant IDs
      if (detection.plant_id !== undefined) {
        aggregated.plantIds.push(detection.plant_id);
      }

      // Collect all data
      aggregated.allData.push(detection.data);
    });

    return aggregated;
  }
}

// Singleton instance
let qrScanClientInstance: QRScanClient | null = null;

export function getQRScanClient(wsUrl?: string): QRScanClient {
  if (!qrScanClientInstance) {
    qrScanClientInstance = new QRScanClient(wsUrl);
  }
  return qrScanClientInstance;
}

export const qrScanClient = getQRScanClient();
