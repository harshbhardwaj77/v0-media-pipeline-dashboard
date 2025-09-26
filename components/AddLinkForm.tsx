"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export function AddLinkForm() {
  const [url, setUrl] = useState("")
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: api.addLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] })
      setUrl("")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      addMutation.mutate(url.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="url"
        placeholder="Enter URL to add..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={addMutation.isPending}
        className="flex-1"
      />
      <Button type="submit" disabled={!url.trim() || addMutation.isPending}>
        <Plus className="h-4 w-4 mr-1" />
        {addMutation.isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  )
}
