"use client"

import { useState, useMemo } from "react"
import { Play, Pause, Download, Trash2, Search, AlertTriangle, Wifi, WifiOff, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LogViewer } from "../LogViewer"
import { useLogs } from "@/hooks/useLogs"

export function LogsPanel() {
  const [searchFilter, setSearchFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState<"all" | "info" | "warn" | "error">("all")

  const { logs, isConnected, isPaused, connectionError, clearLogs, downloadLogs, togglePause } = useLogs()

  const filteredLogs = useMemo(() => {
    let filtered = logs

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((log) => log.level === levelFilter)
    }

    // Apply search filter
    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase()
      filtered = filtered.filter(
        (log) => log.line.toLowerCase().includes(search) || log.level?.toLowerCase().includes(search),
      )
    }

    return filtered
  }, [logs, levelFilter, searchFilter])

  const openInNewWindow = () => {
    const newWindow = window.open("", "_blank", "width=800,height=600")
    if (newWindow) {
      newWindow.document.title = "Pipeline Logs"
      newWindow.document.body.innerHTML = `
        <div id="logs-container" style="font-family: monospace; padding: 20px; background: #000; color: #fff; height: 100vh; overflow-y: auto;">
          <h2>Pipeline Logs (Live)</h2>
          <div id="logs"></div>
        </div>
      `

      // This would need additional implementation to connect to SSE in the new window
      // For now, just show current logs
      const logsDiv = newWindow.document.getElementById("logs")
      if (logsDiv) {
        logsDiv.innerHTML = logs
          .map((log) => `<div>[${log.ts}] ${log.level ? `[${log.level.toUpperCase()}] ` : ""}${log.line}</div>`)
          .join("")
      }
    }
  }

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                Live Logs
              </CardTitle>
              <CardDescription>Real-time pipeline activity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "success" : "error"} className="text-xs">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {logs.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {logs.length} entries
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Connection Error Banner */}
          {connectionError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {connectionError}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isPaused ? "default" : "secondary"} size="sm" onClick={togglePause}>
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPaused ? "Resume log streaming" : "Pause log streaming"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={downloadLogs} disabled={logs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download current logs as .txt file</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear current log buffer (not server logs)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={openInNewWindow} disabled={logs.length === 0}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Pop-out
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open logs in new window</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter logs..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center">Level:</span>
              {(["all", "info", "warn", "error"] as const).map((level) => (
                <Button
                  key={level}
                  variant={levelFilter === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevelFilter(level)}
                  className="text-xs"
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Log Viewer */}
          <div className="flex-1 min-h-0">
            <LogViewer logs={filteredLogs} isPaused={isPaused} isConnected={isConnected} />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
