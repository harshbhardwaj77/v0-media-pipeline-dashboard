"use client"

import { useState } from "react"
import { Copy, Trash2, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { formatRelativeTime, ellipsizeUrl } from "@/lib/utils"
import type { Link } from "@/types/api"

interface LinksTableProps {
  links: Link[]
  onDelete: (id: string) => void
  isDeleting: boolean
}

export function LinksTable({ links, onDelete, isDeleting }: LinksTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const itemsPerPage = 10
  const totalPages = Math.ceil(links.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLinks = links.slice(startIndex, startIndex + itemsPerPage)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Added</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-mono text-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{formatRelativeTime(link.addedAt)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{new Date(link.addedAt).toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-mono text-sm truncate cursor-help">{ellipsizeUrl(link.url, 40)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-all">{link.url}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy URL</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">Open URL</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(link.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete link</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, links.length)} of {links.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
