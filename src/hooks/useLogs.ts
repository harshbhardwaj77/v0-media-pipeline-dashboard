"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { LogEntry } from "@/types/api"
import { createLogStream } from "@/lib/sse"
import { useLocalStorage } from "./useLocalStorage"
import { DEFAULT_SETTINGS } from "@/types/api"

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [settings] = useLocalStorage("pipeline-settings", DEFAULT_SETTINGS)

  const logStreamRef = useRef<ReturnType<typeof createLogStream> | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  const addLogEntry = useCallback(
    (entry: LogEntry) => {
      if (isPaused) return

      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, entry]
        // Limit log entries based on settings
        if (newLogs.length > settings.maxLogLines) {
          return newLogs.slice(-settings.maxLogLines)
        }
        return newLogs
      })
    },
    [isPaused, settings.maxLogLines],
  )

  const handleLogEntry = useCallback(
    (entry: LogEntry) => {
      addLogEntry(entry)
    },
    [addLogEntry],
  )

  const handleError = useCallback((error: Event) => {
    setIsConnected(false)
    setConnectionError("Connection lost - attempting to reconnect...")

    // Schedule reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    reconnectTimeoutRef.current = window.setTimeout(() => {
      if (logStreamRef.current) {
        logStreamRef.current.connect()
      }
    }, 2000)
  }, [])

  const handleOpen = useCallback(() => {
    setIsConnected(true)
    setConnectionError(null)
  }, [])

  const connect = useCallback(() => {
    if (logStreamRef.current) {
      logStreamRef.current.disconnect()
    }

    logStreamRef.current = createLogStream(handleLogEntry, handleError)
    logStreamRef.current.connect()

    // Set up open handler
    const originalConnect = logStreamRef.current.connect
    logStreamRef.current.connect = function () {
      originalConnect.call(this)
      handleOpen()
    }
  }, [handleLogEntry, handleError, handleOpen])

  const disconnect = useCallback(() => {
    if (logStreamRef.current) {
      logStreamRef.current.disconnect()
      logStreamRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const downloadLogs = useCallback(() => {
    const logText = logs
      .map((log) => `[${log.ts}] ${log.level ? `[${log.level.toUpperCase()}] ` : ""}${log.line}`)
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pipeline-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [logs])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  // Initialize connection on mount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    logs,
    isConnected,
    isPaused,
    connectionError,
    connect,
    disconnect,
    clearLogs,
    downloadLogs,
    togglePause,
  }
}
