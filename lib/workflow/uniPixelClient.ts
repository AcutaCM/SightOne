// UniPixel Client for Workflow Engine
// Handles communication with backend UniPixel service with fallback support

export interface UniPixelSegmentationParams {
  imageSource: 'camera' | 'upload' | 'variable';
  imageData?: string; // base64 encoded image
  query: string;
  confidence: number;
  sampleFrames: number;
  visualize: boolean;
}

export interface UniPixelSegmentationResult {
  success: boolean;
  mask_base64: string;
  description: string;
  error?: string;
  processing_time: number;
  used_fallback: boolean;
  service_available: boolean;
  metadata?: Record<string, any>;
}

export interface SegmentationProgress {
  status: string;
  progress: number;
}

export class UniPixelClient {
  private wsEndpoint: string;
  private httpEndpoint: string;

  constructor(
    wsEndpoint: string = 'ws://localhost:8765',
    httpEndpoint: string = 'http://localhost:8765'
  ) {
    this.wsEndpoint = wsEndpoint;
    this.httpEndpoint = httpEndpoint;
  }

  /**
   * Execute segmentation with fallback support
   */
  async segment(
    params: UniPixelSegmentationParams,
    onProgress?: (progress: SegmentationProgress) => void
  ): Promise<UniPixelSegmentationResult> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsEndpoint);
      let resolved = false;

      ws.onopen = () => {
        console.log('🔗 Connected to UniPixel service');
        
        // Send segmentation request
        ws.send(JSON.stringify({
          type: 'unipixel_segment',
          data: {
            image_base64: params.imageData,
            query: params.query,
            sample_frames: params.sampleFrames,
            confidence: params.confidence,
            visualize: params.visualize
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'unipixel_progress':
              if (onProgress) {
                onProgress({
                  status: message.data.status || 'Processing...',
                  progress: message.data.progress || 0
                });
              }
              break;

            case 'unipixel_result':
              if (!resolved) {
                resolved = true;
                ws.close();
                resolve({
                  success: message.data.success,
                  mask_base64: message.data.mask_base64 || '',
                  description: message.data.description || '',
                  error: message.data.error,
                  processing_time: message.data.processing_time || 0,
                  used_fallback: message.data.used_fallback || false,
                  service_available: message.data.service_available !== false,
                  metadata: message.data.metadata
                });
              }
              break;

            case 'unipixel_error':
              if (!resolved) {
                resolved = true;
                ws.close();
                reject(new Error(message.data.error || 'Segmentation failed'));
              }
              break;

            case 'service_status':
              // Handle service status updates
              if (message.data.unipixel_available === false && onProgress) {
                onProgress({
                  status: 'UniPixel service unavailable, using fallback...',
                  progress: 0
                });
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (!resolved) {
          resolved = true;
          reject(new Error('WebSocket connection error'));
        }
      };

      ws.onclose = () => {
        console.log('🔌 Disconnected from UniPixel service');
        if (!resolved) {
          resolved = true;
          reject(new Error('Connection closed unexpectedly'));
        }
      };

      // Timeout after 60 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          reject(new Error('Segmentation timeout'));
        }
      }, 60000);
    });
  }

  /**
   * Check service availability
   */
  async checkAvailability(): Promise<{
    unipixel_available: boolean;
    fallback_enabled: boolean;
    local_service_available: boolean;
  }> {
    try {
      const response = await fetch(`${this.httpEndpoint}/api/unipixel/status`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to check service status');
    } catch (error) {
      console.error('Error checking service availability:', error);
      return {
        unipixel_available: false,
        fallback_enabled: true,
        local_service_available: true
      };
    }
  }

  /**
   * Get service status with detailed information
   */
  async getServiceStatus(): Promise<{
    unipixel_available: boolean;
    fallback_enabled: boolean;
    local_service_available: boolean;
    last_check_time: number;
  }> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsEndpoint);
      let resolved = false;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'get_service_status',
          service: 'unipixel'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'service_status' && !resolved) {
            resolved = true;
            ws.close();
            resolve(message.data);
          }
        } catch (error) {
          console.error('Error parsing status message:', error);
        }
      };

      ws.onerror = (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          reject(new Error('Status check timeout'));
        }
      }, 5000);
    });
  }
}

// Singleton instance
let uniPixelClientInstance: UniPixelClient | null = null;

export function getUniPixelClient(): UniPixelClient {
  if (!uniPixelClientInstance) {
    uniPixelClientInstance = new UniPixelClient();
  }
  return uniPixelClientInstance;
}
