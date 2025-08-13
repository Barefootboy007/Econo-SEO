/**
 * WebSocket service for real-time communication
 * Handles scraping progress updates and job notifications
 */

import { io, Socket } from 'socket.io-client';

// WebSocket event types
export interface ScrapingProgressEvent {
  job_id: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  current_url?: string;
  pages_scraped?: number;
  total_pages?: number;
  errors?: string[];
  timestamp: string;
}

export interface ScrapingCompleteEvent {
  job_id: string;
  success: boolean;
  pages_scraped: number;
  total_pages: number;
  duration?: number;
  errors?: string[];
  timestamp: string;
}

export interface ScrapingErrorEvent {
  job_id: string;
  error: string;
  error_type: string;
  timestamp: string;
}

// Event listener types
type EventCallback<T = any> = (data: T) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;

  /**
   * Connect to WebSocket server
   */
  connect(authToken?: string): void {
    if (this.socket?.connected || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000';

    // Create socket connection with auth
    this.socket = io(wsUrl, {
      path: '/ws/socket.io',
      transports: ['websocket', 'polling'],
      auth: authToken ? { token: authToken } : undefined,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
    });

    // Set up connection event handlers
    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('ws_connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.emit('ws_disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('ws_error', { error: 'Max reconnection attempts reached' });
      } else {
        // Exponential backoff for reconnection
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
      }
    });

    // Set up message handlers for scraping events
    this.setupEventHandlers();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Join a scraping job room for updates
   */
  joinScrapingJob(jobId: string): void {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit('join_scraping_job', { job_id: jobId });
    console.log(`Joined scraping job room: ${jobId}`);
  }

  /**
   * Leave a scraping job room
   */
  leaveScrapingJob(jobId: string): void {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit('leave_scraping_job', { job_id: jobId });
    console.log(`Left scraping job room: ${jobId}`);
  }

  /**
   * Subscribe to WebSocket events
   */
  on<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Also register with Socket.IO if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off<T = any>(event: string, callback: EventCallback<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    // Also unregister from Socket.IO if connected
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emit a custom event
   */
  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Set up handlers for scraping-specific events
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Handle scraping progress updates
    this.socket.on('scraping_progress', (data: ScrapingProgressEvent) => {
      console.log('Scraping progress:', data);
      this.notifyListeners('scraping_progress', data);
    });

    // Handle scraping completion
    this.socket.on('scraping_complete', (data: ScrapingCompleteEvent) => {
      console.log('Scraping complete:', data);
      this.notifyListeners('scraping_complete', data);
    });

    // Handle scraping errors
    this.socket.on('scraping_error', (data: ScrapingErrorEvent) => {
      console.error('Scraping error:', data);
      this.notifyListeners('scraping_error', data);
    });

    // Handle job room events
    this.socket.on('joined_job', (data) => {
      console.log('Joined job room:', data);
      this.notifyListeners('joined_job', data);
    });

    this.socket.on('left_job', (data) => {
      console.log('Left job room:', data);
      this.notifyListeners('left_job', data);
    });

    // Handle general errors
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', error);
    });
  }

  /**
   * Notify all listeners for an event
   */
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export convenience functions
export const connectWebSocket = (authToken?: string) => websocketService.connect(authToken);
export const disconnectWebSocket = () => websocketService.disconnect();
export const joinScrapingJob = (jobId: string) => websocketService.joinScrapingJob(jobId);
export const leaveScrapingJob = (jobId: string) => websocketService.leaveScrapingJob(jobId);
export const onWebSocketEvent = <T = any>(event: string, callback: EventCallback<T>) => 
  websocketService.on(event, callback);
export const offWebSocketEvent = <T = any>(event: string, callback: EventCallback<T>) => 
  websocketService.off(event, callback);