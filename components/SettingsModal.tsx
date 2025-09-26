"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useLocalStorage("api-url", "http://localhost:8081")
  const [autoRefresh, setAutoRefresh] = useLocalStorage("auto-refresh", true)
  const [refreshInterval, setRefreshInterval] = useLocalStorage("refresh-interval", 5000)
  const [maxLogLines, setMaxLogLines] = useLocalStorage("max-log-lines", 1000)

  const [tempApiUrl, setTempApiUrl] = useState(apiUrl)
  const [tempRefreshInterval, setTempRefreshInterval] = useState(refreshInterval.toString())
  const [tempMaxLogLines, setTempMaxLogLines] = useState(maxLogLines.toString())

  useEffect(() => {
    if (open) {
      setTempApiUrl(apiUrl)
      setTempRefreshInterval(refreshInterval.toString())
      setTempMaxLogLines(maxLogLines.toString())
    }
  }, [open, apiUrl, refreshInterval, maxLogLines])

  const handleSave = () => {
    setApiUrl(tempApiUrl)
    setRefreshInterval(Number.parseInt(tempRefreshInterval) || 5000)
    setMaxLogLines(Number.parseInt(tempMaxLogLines) || 1000)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempApiUrl(apiUrl)
    setTempRefreshInterval(refreshInterval.toString())
    setTempMaxLogLines(maxLogLines.toString())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-url" className="text-right">
              API URL
            </Label>
            <Input
              id="api-url"
              value={tempApiUrl}
              onChange={(e) => setTempApiUrl(e.target.value)}
              className="col-span-3"
              placeholder="http://localhost:8081"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="auto-refresh" className="text-right">
              Auto Refresh
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="col-span-3 justify-self-start"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="refresh-interval" className="text-right">
              Refresh Interval (ms)
            </Label>
            <Input
              id="refresh-interval"
              type="number"
              value={tempRefreshInterval}
              onChange={(e) => setTempRefreshInterval(e.target.value)}
              className="col-span-3"
              min="1000"
              step="1000"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max-log-lines" className="text-right">
              Max Log Lines
            </Label>
            <Input
              id="max-log-lines"
              type="number"
              value={tempMaxLogLines}
              onChange={(e) => setTempMaxLogLines(e.target.value)}
              className="col-span-3"
              min="100"
              step="100"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
