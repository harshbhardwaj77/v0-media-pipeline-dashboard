"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export function BulkAddForm() {
  const [urls, setUrls] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const bulkAddMutation = useMutation({
    mutationFn: api.addBulkLinks,
    onSuccess: (data) => {
      const count = data.created || 0
      toast({
        title: "Links Added",
        description: `Successfully added ${count} link${count !== 1 ? "s" : ""}.`,
      })
      setUrls("")
      queryClient.invalidateQueries({ queryKey: ["links"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Links",
        description: error.message || "An error occurred while adding the links.",
        variant: "destructive",
      })
    },
  })

  const validateUrls = (urlList: string[]): { valid: string[]; invalid: string[] } => {
    const valid: string[] = []
    const invalid: string[] = []

    urlList.forEach((url) => {
      if (url.trim().startsWith("https://mega.nz/")) {
        valid.push(url.trim())
      } else if (url.trim()) {
        invalid.push(url.trim())
      }
    })

    return { valid, invalid }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!urls.trim()) {
      toast({
        title: "No URLs Provided",
        description: "Please enter one or more MEGA.nz URLs.",
        variant: "destructive",
      })
      return
    }

    const urlList = urls.split("\n").filter((url) => url.trim())
    const { valid, invalid } = validateUrls(urlList)

    if (invalid.length > 0) {
      toast({
        title: "Invalid URLs Found",
        description: `${invalid.length} URL${invalid.length !== 1 ? "s" : ""} don't start with https://mega.nz/`,
        variant: "destructive",
      })
      return
    }

    if (valid.length === 0) {
      toast({
        title: "No Valid URLs",
        description: "Please enter at least one valid MEGA.nz URL.",
        variant: "destructive",
      })
      return
    }

    bulkAddMutation.mutate(valid)
  }

  const urlCount = urls.split("\n").filter((url) => url.trim()).length

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-sm font-medium">Add Multiple Links</h4>
      <Textarea
        placeholder="https://mega.nz/folder/...&#10;https://mega.nz/folder/...&#10;(one URL per line)"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        className="min-h-[100px] resize-none"
        disabled={bulkAddMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {urlCount > 0 && `${urlCount} URL${urlCount !== 1 ? "s" : ""} entered`}
        </span>
        <Button type="submit" disabled={bulkAddMutation.isPending || !urls.trim()} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {bulkAddMutation.isPending ? "Adding..." : "Add All"}
        </Button>
      </div>
    </form>
  )
}
