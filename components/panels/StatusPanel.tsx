"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadges } from "@/components/StatusBadges"
import { api } from "@/lib/api"
import { Play, Square, RefreshCw } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

export function StatusPanel() {
  const [autoRefresh] = useLocalStorage("auto-refresh", true)
  const [refreshInterval] = useLocalStorage("refresh-interval", 5000)

  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["status"],
    queryFn: api.getStatus,
    refetchInterval: autoRefresh ? refreshInterval : false,
    retry: 2,
  })

  const handleStart = async () => {
    try {
      await api.startPipeline()
      refetch()
    } catch (error) {
      console.error("Failed to start pipeline:", error)
    }
  }

  const handleStop = async () => {
    try {
      await api.stopPipeline()
      refetch()
    } catch (error) {
      console.error("Failed to stop pipeline:", error)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-sm text-destructive">Failed to load status</div>}
        {status && (
          <>
            <StatusBadges status={status} />
            <div className="flex space-x-2">
              <Button onClick={handleStart} disabled={status.pipeline_running} size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
              <Button
                onClick={handleStop}
                disabled={!status.pipeline_running}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
