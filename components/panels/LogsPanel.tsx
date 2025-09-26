"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogViewer } from "@/components/LogViewer"

export function LogsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium">System Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <LogViewer />
      </CardContent>
    </Card>
  )
}
