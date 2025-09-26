"use client"

import { useEffect, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Badge } from "@/components/ui/badge"
import type { LogEntry } from "@/types/api"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { DEFAULT_SETTINGS } from "@/types/api"
import { AlertTriangle, Wifi } from "lucide-react"

interface LogViewerProps {
  logs: LogEntry[]
  isPaused: boolean
  isConnected: boolean
}

export function LogViewer({ logs, isPaused, isConnected }: LogViewerProps) {
  const [settings] = useLocalStorage("pipeline-settings", DEFAULT_SETTINGS)
  const parentRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // Approximate height of each log line
    overscan: 10,
  })

  // Auto-scroll to bottom when new logs arrive (if enabled and at bottom)
  useEffect(() => {
    if (settings.autoScrollLogs && isAtBottom && !isPaused && logs.length > 0) {
      const scrollElement = parentRef.current
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [logs.length, settings.autoScrollLogs, isAtBottom, isPaused])

  // Track if user is at bottom
  useEffect(() => {
    const scrollElement = parentRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
      setIsAtBottom(atBottom)
    }

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [])

  const getLevelVariant = (level?: string) => {
    switch (level) {
      case "error":
        return "error"
      case "warn":
        return "warning"
      case "info":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      })
    } catch {
      return ts
    }
  }

  if (logs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="text-center space-y-3">
          {isConnected ? (
            <>
              <Wifi className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Waiting for logs...</h3>
                <p className="text-sm text-muted-foreground">
                  Connected to log stream. Logs will appear here when available.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No stream connection</h3>
                <p className="text-sm text-muted-foreground">Attempting to connect to log stream...</p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div
        ref={parentRef}
        className="flex-1 overflow-auto bg-background border rounded-lg font-mono text-sm"
        style={{
          height: "100%",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const log = logs[virtualItem.index]
            return (
              <div
                key={virtualItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="flex items-start gap-2 px-3 py-1 hover:bg-muted/50 border-b border-muted/20"
              >
                <span className="text-muted-foreground text-xs shrink-0 mt-0.5">{formatTimestamp(log.ts)}</span>
                {log.level && (
                  <Badge variant={getLevelVariant(log.level)} className="text-xs shrink-0 mt-0.5">
                    {log.level.toUpperCase()}
                  </Badge>
                )}
                <span className="flex-1 break-all leading-relaxed">{log.line}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-4">
          <span>{logs.length} entries</span>
          {isPaused && (
            <Badge variant="warning" className="text-xs">
              Paused
            </Badge>
          )}
          {!isAtBottom && settings.autoScrollLogs && (
            <Badge variant="secondary" className="text-xs">
              Scroll to see new logs
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span>{isConnected ? "Live" : "Disconnected"}</span>
        </div>
      </div>
    </div>
  )
}
