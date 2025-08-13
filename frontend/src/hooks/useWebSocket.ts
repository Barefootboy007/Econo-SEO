/**
 * React hook for WebSocket integration
 * Provides easy access to WebSocket functionality in components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  websocketService,
  connectWebSocket,
  disconnectWebSocket,
  joinScrapingJob,
  leaveScrapingJob,
  onWebSocketEvent,
  offWebSocketEvent,
  ScrapingProgressEvent,
  ScrapingCompleteEvent,
  ScrapingErrorEvent
} from '../services/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  authToken?: string;
  jobId?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinJob: (jobId: string) => void;
  leaveJob: (jobId: string) => void;
  on: <T = any>(event: string, callback: (data: T) => void) => void;
  off: <T = any>(event: string, callback: (data: T) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, authToken, jobId } = options;
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);

  // Track connection status
  useEffect(() => {
    const handleConnect = () => {
      if (mountedRef.current) {
        setIsConnected(true);
      }
    };

    const handleDisconnect = () => {
      if (mountedRef.current) {
        setIsConnected(false);
      }
    };

    onWebSocketEvent('ws_connected', handleConnect);
    onWebSocketEvent('ws_disconnected', handleDisconnect);

    return () => {
      offWebSocketEvent('ws_connected', handleConnect);
      offWebSocketEvent('ws_disconnected', handleDisconnect);
    };
  }, []);

  // Auto-connect on mount if requested
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket(authToken);
      setIsConnected(websocketService.isConnected());
    }

    return () => {
      mountedRef.current = false;
      if (autoConnect) {
        disconnectWebSocket();
      }
    };
  }, [autoConnect, authToken]);

  // Auto-join job room if jobId provided
  useEffect(() => {
    if (jobId && isConnected) {
      joinScrapingJob(jobId);

      return () => {
        leaveScrapingJob(jobId);
      };
    }
  }, [jobId, isConnected]);

  const connect = useCallback(() => {
    connectWebSocket(authToken);
  }, [authToken]);

  const disconnect = useCallback(() => {
    disconnectWebSocket();
  }, []);

  const joinJob = useCallback((jobId: string) => {
    joinScrapingJob(jobId);
  }, []);

  const leaveJob = useCallback((jobId: string) => {
    leaveScrapingJob(jobId);
  }, []);

  const on = useCallback(<T = any>(event: string, callback: (data: T) => void) => {
    onWebSocketEvent(event, callback);
  }, []);

  const off = useCallback(<T = any>(event: string, callback: (data: T) => void) => {
    offWebSocketEvent(event, callback);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    joinJob,
    leaveJob,
    on,
    off
  };
}

/**
 * Hook for tracking scraping job progress
 */
interface UseScrapingProgressOptions {
  jobId: string;
  onProgress?: (data: ScrapingProgressEvent) => void;
  onComplete?: (data: ScrapingCompleteEvent) => void;
  onError?: (data: ScrapingErrorEvent) => void;
}

interface ScrapingProgress {
  jobId: string;
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  currentUrl?: string;
  pagesScraped: number;
  totalPages?: number;
  errors: string[];
}

export function useScrapingProgress(options: UseScrapingProgressOptions) {
  const { jobId, onProgress, onComplete, onError } = options;
  const [progress, setProgress] = useState<ScrapingProgress>({
    jobId,
    status: 'idle',
    progress: 0,
    message: 'Waiting to start...',
    pagesScraped: 0,
    errors: []
  });

  const { isConnected, joinJob, leaveJob, on, off } = useWebSocket({ jobId });

  useEffect(() => {
    if (!isConnected || !jobId) return;

    const handleProgress = (data: ScrapingProgressEvent) => {
      if (data.job_id === jobId) {
        setProgress(prev => ({
          ...prev,
          status: data.status,
          progress: data.progress,
          message: data.message,
          currentUrl: data.current_url,
          pagesScraped: data.pages_scraped || prev.pagesScraped,
          totalPages: data.total_pages,
          errors: data.errors || prev.errors
        }));
        onProgress?.(data);
      }
    };

    const handleComplete = (data: ScrapingCompleteEvent) => {
      if (data.job_id === jobId) {
        setProgress(prev => ({
          ...prev,
          status: data.success ? 'completed' : 'failed',
          progress: 100,
          message: data.success ? 'Scraping completed successfully' : 'Scraping failed',
          pagesScraped: data.pages_scraped,
          totalPages: data.total_pages,
          errors: data.errors || prev.errors
        }));
        onComplete?.(data);
      }
    };

    const handleError = (data: ScrapingErrorEvent) => {
      if (data.job_id === jobId) {
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          message: data.error,
          errors: [...prev.errors, data.error]
        }));
        onError?.(data);
      }
    };

    // Subscribe to events
    on<ScrapingProgressEvent>('scraping_progress', handleProgress);
    on<ScrapingCompleteEvent>('scraping_complete', handleComplete);
    on<ScrapingErrorEvent>('scraping_error', handleError);

    // Cleanup
    return () => {
      off('scraping_progress', handleProgress);
      off('scraping_complete', handleComplete);
      off('scraping_error', handleError);
    };
  }, [isConnected, jobId, on, off, onProgress, onComplete, onError]);

  return progress;
}