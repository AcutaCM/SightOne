/**
 * Challenge Task Client
 * Client for executing challenge card tasks via WebSocket
 */

export interface ChallengeTaskResult {
  success: boolean;
  score?: number;
  completionTime?: number;
  details?: Record<string, any>;
  error?: string;
}

export interface Challenge8FlightParams {
  radius: number;
  speed: number;
  loops: number;
  timeout: number;
}

export interface ChallengeObstacleParams {
  obstaclePositions: Array<{ x: number; y: number; z: number }>;
  speed: number;
  safetyMargin: number;
  timeout: number;
}

export interface ChallengePrecisionLandParams {
  targetPosition: { x: number; y: number };
  precision: number;
  maxAttempts: number;
  timeout: number;
}

export class ChallengeTaskClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(private wsUrl: string = 'ws://localhost:8000/ws') {}

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('Challenge task client connected');
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Challenge task client disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Execute 8-figure flight task
   */
  async execute8Flight(params: Challenge8FlightParams): Promise<ChallengeTaskResult> {
    return this.executeTask('challenge_8_flight', params);
  }

  /**
   * Execute obstacle navigation task
   */
  async executeObstacleNavigation(params: ChallengeObstacleParams): Promise<ChallengeTaskResult> {
    return this.executeTask('challenge_obstacle', params);
  }

  /**
   * Execute precision landing task
   */
  async executePrecisionLanding(params: ChallengePrecisionLandParams): Promise<ChallengeTaskResult> {
    return this.executeTask('challenge_precision_land', params);
  }

  /**
   * Execute a challenge task
   */
  private async executeTask(taskType: string, params: any): Promise<ChallengeTaskResult> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = `${taskType}_${Date.now()}`;
      const timeout = params.timeout ? params.timeout * 1000 + 5000 : 65000; // Add 5s buffer

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.messageHandlers.delete(requestId);
        reject(new Error(`Task execution timeout after ${timeout}ms`));
      }, timeout);

      // Set up response handler
      this.messageHandlers.set(requestId, (data) => {
        clearTimeout(timeoutId);
        this.messageHandlers.delete(requestId);

        if (data.success) {
          resolve({
            success: true,
            score: data.score,
            completionTime: data.completion_time,
            details: data.details,
          });
        } else {
          resolve({
            success: false,
            error: data.error || 'Task execution failed',
            details: data.details,
          });
        }
      });

      // Send request
      this.ws!.send(
        JSON.stringify({
          type: 'challenge_task',
          task_type: taskType,
          request_id: requestId,
          params: params,
        })
      );
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any): void {
    const { type, request_id, data } = message;

    if (type === 'challenge_task_result' && request_id) {
      const handler = this.messageHandlers.get(request_id);
      if (handler) {
        handler(data);
      }
    } else if (type === 'challenge_task_progress') {
      // Emit progress event
      this.emitProgress(data);
    }
  }

  /**
   * Emit progress event
   */
  private emitProgress(data: any): void {
    // Dispatch custom event for progress updates
    window.dispatchEvent(
      new CustomEvent('challenge_task_progress', {
        detail: data,
      })
    );
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (data: any) => void): () => void {
    const handler = (event: Event) => {
      callback((event as CustomEvent).detail);
    };

    window.addEventListener('challenge_task_progress', handler);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('challenge_task_progress', handler);
    };
  }
}

// Singleton instance
let challengeTaskClient: ChallengeTaskClient | null = null;

/**
 * Get or create challenge task client instance
 */
export function getChallengeTaskClient(): ChallengeTaskClient {
  if (!challengeTaskClient) {
    challengeTaskClient = new ChallengeTaskClient();
  }
  return challengeTaskClient;
}
