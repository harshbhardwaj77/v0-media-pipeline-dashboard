"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

export function LogViewer() {
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: api.getLogs,
    refetchInterval: 2000,
  })

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const getLevelColor = (level?: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warn":
        return "secondary"
      case "info":
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading logs...</div>
  }

  if (!logs?.length) {
    return <div className="text-center py-4 text-muted-foreground">No logs available</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{logs.length} log entries</span>
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
          <span>Auto-scroll</span>
        </label>
      </div>
      <div ref={scrollRef} className="h-[400px] overflow-y-auto border rounded-md p-2 bg-muted/50 font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-2 py-1">
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {new Date(log.ts).toLocaleTimeString()}
            </span>
            {log.level && (
              <Badge variant={getLevelColor(log.level)} className="text-xs">
                {log.level.toUpperCase()}
              </Badge>
            )}
            <span className="flex-1 break-all">{log.line}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
