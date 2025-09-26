"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

export function BulkAddForm() {
  const [urls, setUrls] = useState("")
  const queryClient = useQueryClient()

  const bulkAddMutation = useMutation({
    mutationFn: api.bulkAddLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] })
      setUrls("")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urls.trim()) {
      const urlList = urls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      if (urlList.length > 0) {
        bulkAddMutation.mutate(urlList)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Enter multiple URLs (one per line)..."
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        disabled={bulkAddMutation.isPending}
        rows={4}
      />
      <Button type="submit" disabled={!urls.trim() || bulkAddMutation.isPending} className="w-full">
        <Upload className="h-4 w-4 mr-1" />
        {bulkAddMutation.isPending ? "Adding..." : "Bulk Add"}
      </Button>
    </form>
  )
}
