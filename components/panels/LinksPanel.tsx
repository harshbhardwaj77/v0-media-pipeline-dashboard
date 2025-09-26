"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinksTable } from "@/components/LinksTable"
import { AddLinkForm } from "@/components/AddLinkForm"
import { BulkAddForm } from "@/components/BulkAddForm"

export function LinksPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Links Management</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-hidden">
        <AddLinkForm />
        <BulkAddForm />
        <div className="flex-1 overflow-hidden">
          <LinksTable />
        </div>
      </CardContent>
    </Card>
  )
}
