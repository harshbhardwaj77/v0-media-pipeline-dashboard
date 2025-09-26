"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { type UserSettings, DEFAULT_SETTINGS } from "@/types/api"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [settings, setSettings] = useLocalStorage<UserSettings>("pipeline-settings", DEFAULT_SETTINGS)
  const [tempSettings, setTempSettings] = useState<UserSettings>(settings)

  useEffect(() => {
    if (open) {
      setTempSettings(settings)
    }
  }, [open, settings])

  const handleSave = () => {
    setSettings(tempSettings)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempSettings(settings)
    onOpenChange(false)
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Configure dashboard behavior and preferences</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Auto-scroll logs */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-scroll">Auto-scroll logs</Label>
                <p className="text-sm text-muted-foreground">Automatically scroll to new log entries</p>
              </div>
              <Switch
                id="auto-scroll"
                checked={tempSettings.autoScrollLogs}
                onCheckedChange={(checked) => setTempSettings((prev) => ({ ...prev, autoScrollLogs: checked }))}
              />
            </div>

            {/* Poll status if SSE unavailable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="poll-status">Poll status if SSE unavailable</Label>
                <p className="text-sm text-muted-foreground">Fall back to polling when real-time updates fail</p>
              </div>
              <Switch
                id="poll-status"
                checked={tempSettings.pollStatusIfSSEUnavailable}
                onCheckedChange={(checked) =>
                  setTempSettings((prev) => ({ ...prev, pollStatusIfSSEUnavailable: checked }))
                }
              />
            </div>

            {/* Status poll interval */}
            <div className="space-y-2">
              <Label htmlFor="poll-interval">Status poll interval (ms)</Label>
              <Input
                id="poll-interval"
                type="number"
                min="1000"
                max="30000"
                step="500"
                value={tempSettings.statusPollInterval}
                onChange={(e) =>
                  setTempSettings((prev) => ({
                    ...prev,
                    statusPollInterval: Number.parseInt(e.target.value) || DEFAULT_SETTINGS.statusPollInterval,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">How often to check status when polling (1000-30000ms)</p>
            </div>

            {/* Max log lines */}
            <div className="space-y-2">
              <Label htmlFor="max-logs">Maximum log lines</Label>
              <Input
                id="max-logs"
                type="number"
                min="1000"
                max="50000"
                step="1000"
                value={tempSettings.maxLogLines}
                onChange={(e) =>
                  setTempSettings((prev) => ({
                    ...prev,
                    maxLogLines: Number.parseInt(e.target.value) || DEFAULT_SETTINGS.maxLogLines,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">Maximum number of log entries to keep in memory</p>
            </div>

            {/* Read-only settings */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <div className="flex items-center gap-2">
                  <Input value={getApiBase()} readOnly className="font-mono text-sm" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set via VITE_API_BASE environment variable</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Docker Integration</Label>
                <div className="flex items-center gap-2">
                  <Input value="Connected via Docker socket" readOnly className="text-sm" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pipeline connects to Docker via /var/run/docker.sock</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
