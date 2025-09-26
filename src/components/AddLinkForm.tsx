"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export function AddLinkForm() {
  const [url, setUrl] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: api.addLink,
    onSuccess: () => {
      toast({
        title: "Link Added",
        description: "The MEGA.nz link has been added successfully.",
      })
      setUrl("")
      queryClient.invalidateQueries({ queryKey: ["links"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Link",
        description: error.message || "An error occurred while adding the link.",
        variant: "destructive",
      })
    },
  })

  const validateUrl = (url: string): boolean => {
    return url.trim().startsWith("https://mega.nz/")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a MEGA.nz URL.",
        variant: "destructive",
      })
      return
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "URL must start with https://mega.nz/",
        variant: "destructive",
      })
      return
    }

    addMutation.mutate(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-sm font-medium">Add Single Link</h4>
      <div className="flex gap-2">
        <Input
          placeholder="https://mega.nz/folder/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={addMutation.isPending}
        />
        <Button type="submit" disabled={addMutation.isPending || !url.trim()} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          {addMutation.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  )
}
