"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, AlertTriangle, LinkIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { LinksTable } from "../LinksTable"
import { AddLinkForm } from "../AddLinkForm"
import { BulkAddForm } from "../BulkAddForm"

export function LinksPanel() {
  const [searchFilter, setSearchFilter] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: linksData,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["links"],
    queryFn: api.getLinks,
    refetchInterval: 5000,
    retry: false,
  })

  const links = linksData?.items || []

  const filteredLinks = useMemo(() => {
    if (!searchFilter.trim()) return links
    const filter = searchFilter.toLowerCase()
    return links.filter((link) => link.url.toLowerCase().includes(filter) || link.id.toLowerCase().includes(filter))
  }, [links, searchFilter])

  const deleteMutation = useMutation({
    mutationFn: api.deleteLink,
    onSuccess: () => {
      toast({
        title: "Link Deleted",
        description: "The link has been removed successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["links"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Link",
        description: error.message || "An error occurred while deleting the link.",
        variant: "destructive",
      })
    },
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  if (isError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Links Manager
          </CardTitle>
          <CardDescription>Manage MEGA.nz download links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Unable to load links - API connection failed</p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["links"] })}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Links Manager
            </CardTitle>
            <CardDescription>Manage MEGA.nz download links</CardDescription>
          </div>
          {links.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {links.length} link{links.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Add Single Link */}
        <AddLinkForm />

        {/* Add Bulk Links */}
        <BulkAddForm />

        {/* Search Filter */}
        {links.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Links Table */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading links...</div>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No links added yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Add MEGA.nz folder links to start processing</p>
            </div>
          ) : (
            <LinksTable links={filteredLinks} onDelete={handleDelete} isDeleting={deleteMutation.isPending} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
