import type { LogEntry } from "@/types/api"

// Handle API base URL safely
const getApiBase = (): string => {
  try {
    if (import.meta?.env?.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE
    }
  } catch (error) {
    console.warn("Environment variable access failed, using default API base")
  }
  return "http://localhost:8081"
}

const API_BASE = getApiBase()

export class SSEConnection {
  private eventSource: EventSource | null = null
  private reconnectTimeout: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private baseReconnectDelay = 1000

  constructor(
    private endpoint: string,
    private onMessage: (data: any) => void,
    private onError?: (error: Event) => void,
    private onOpen?: () => void,
  ) {}

  connect() {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return
    }

    try {
      this.eventSource = new EventSource(`${API_BASE}${this.endpoint}`)

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0
        this.onOpen?.()
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessage(data)
        } catch (error) {
          console.error("Failed to parse SSE message:", error)
        }
      }

      this.eventSource.onerror = (error) => {
        this.onError?.(error)
        this.scheduleReconnect()
      }
    } catch (error) {
      console.error("Failed to create SSE connection:", error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached")
      return
    }

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000 // Add jitter

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

export function createLogStream(onLogEntry: (entry: LogEntry) => void, onError?: (error: Event) => void) {
  return new SSEConnection("/api/logs/stream", onLogEntry, onError)
}

export function createStatusStream(onStatusUpdate: (status: any) => void, onError?: (error: Event) => void) {
  return new SSEConnection("/api/status/stream", onStatusUpdate, onError)
}
