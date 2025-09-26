"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Play, Square, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { formatRelativeTime } from "@/lib/utils"

export function StatusPanel() {
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: status,
    isError,
    error,
  } = useQuery({
    queryKey: ["status"],
    queryFn: api.getStatus,
    refetchInterval: 2000,
    retry: false,
  })

  const { data: linksData } = useQuery({
    queryKey: ["links"],
    queryFn: api.getLinks,
    retry: false,
  })

  const startMutation = useMutation({
    mutationFn: api.startPipeline,
    onSuccess: () => {
      toast({
        title: "Pipeline Started",
        description: "The media pipeline has been started successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["status"] })
      setShowStartConfirm(false)
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Pipeline",
        description: error.message || "An error occurred while starting the pipeline.",
        variant: "destructive",
      })
      setShowStartConfirm(false)
    },
  })

  const stopMutation = useMutation({
    mutationFn: api.stopPipeline,
    onSuccess: () => {
      toast({
        title: "Pipeline Stopped",
        description: "The media pipeline has been stopped successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["status"] })
      setShowStopConfirm(false)
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Stop Pipeline",
        description: error.message || "An error occurred while stopping the pipeline.",
        variant: "destructive",
      })
      setShowStopConfirm(false)
    },
  })

  const handleStart = () => {
    const hasLinks = linksData?.items && linksData.items.length > 0
    if (!hasLinks) {
      setShowStartConfirm(true)
    } else {
      startMutation.mutate()
    }
  }

  const handleStop = () => {
    setShowStopConfirm(true)
  }

  const confirmStart = () => {
    startMutation.mutate()
  }

  const confirmStop = () => {
    stopMutation.mutate()
  }

  if (isError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Status & Controls
          </CardTitle>
          <CardDescription>Pipeline control and monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              API unreachable - Unable to connect to the pipeline service
            </p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["status"] })}>
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Status & Controls</CardTitle>
          <CardDescription>Pipeline control and monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">System Status</h4>
            <div className="flex flex-col gap-2">
              <Badge
                variant={
                  status?.pipeline === "running" ? "success" : status?.pipeline === "stopped" ? "secondary" : "outline"
                }
                className="justify-start"
              >
                Pipeline: {status?.pipeline?.charAt(0).toUpperCase() + status?.pipeline?.slice(1) || "Unknown"}
              </Badge>
              <Badge
                variant={status?.vpn === "up" ? "success" : status?.vpn === "down" ? "error" : "outline"}
                className="justify-start"
              >
                VPN: {status?.vpn?.toUpperCase() || "Unknown"}
              </Badge>
              <div className="flex items-center gap-2">
                <Badge
                  variant={status?.tor === "up" ? "success" : status?.tor === "down" ? "error" : "outline"}
                  className="justify-start"
                >
                  Tor: {status?.tor?.toUpperCase() || "Unknown"}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tor routing makes uploads slower than normal (expected behavior)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Pipeline Control</h4>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleStart}
                disabled={status?.pipeline === "running" || startMutation.isPending}
                className="w-full justify-start"
              >
                <Play className="h-4 w-4 mr-2" />
                {startMutation.isPending ? "Starting..." : "Start Pipeline"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleStop}
                disabled={status?.pipeline === "stopped" || stopMutation.isPending}
                className="w-full justify-start"
              >
                <Square className="h-4 w-4 mr-2" />
                {stopMutation.isPending ? "Stopping..." : "Stop Pipeline"}
              </Button>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">System Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Container:</span>
                <span className="font-mono">{status?.containerName || "Unknown"}</span>
              </div>

              {status?.lastRunAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last run:</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{formatRelativeTime(status.lastRunAt)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{new Date(status.lastRunAt).toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {status?.cleanJobs !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clean jobs:</span>
                  <span>{status.cleanJobs}</span>
                </div>
              )}

              {status?.version && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-mono">{status.version}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showStartConfirm} onOpenChange={setShowStartConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Pipeline</DialogTitle>
            <DialogDescription>
              No links have been added yet. The pipeline will start but won't have anything to process until you add
              MEGA.nz links. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStart} disabled={startMutation.isPending}>
              {startMutation.isPending ? "Starting..." : "Start Anyway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stop Confirmation Dialog */}
      <Dialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Pipeline</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop the media pipeline? This will halt all current processing and downloads.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmStop} disabled={stopMutation.isPending}>
              {stopMutation.isPending ? "Stopping..." : "Stop Pipeline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
