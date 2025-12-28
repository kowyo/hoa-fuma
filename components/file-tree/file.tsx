"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useFileTree } from "./ctx"
import { getFileIcon, formatBytes, getAcceleratedUrl, getFileExtension } from "./utils"
import { ExternalLinkIcon, DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/ui/circular-progress"
import { downloadSingleFile } from "@/lib/download"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export function File({ 
  name, 
  date = "-", 
  size, 
  url,
  type
}: { 
  name: string, 
  date?: string, 
  size?: number,
  url?: string,
  type?: string
}) {
  const { level, path, selected, toggleSelect, isSelectable, searchQuery, isAccelerated } = useFileTree()
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const fullPath = path ? `${path}/${name}` : name
  const isSelected = selected.has(fullPath)
  const finalUrl = url && isAccelerated ? getAcceleratedUrl(url) : url

  if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null
  }

  const handleDownload = async (e: React.MouseEvent) => {
    if (!finalUrl) return
    e.preventDefault()
    setIsDownloading(true)
    setProgress(0)

    try {
      await downloadSingleFile(finalUrl, name, setProgress)
    } catch (error: any) {
      console.error("Download failed:", error)
      toast.error(`下载失败: ${error.message}`)
    } finally {
      setIsDownloading(false)
      setProgress(0)
    }
  }

  return (
    <TableRow 
      className="hover:bg-muted/50 min-h-12"
      data-selected={isSelected || undefined}
    >
      <TableCell className="w-10 py-2">
        {isSelectable && (
          <div className="flex items-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelect(fullPath)}
              aria-label={`Select ${name}`}
            />
          </div>
        )}
      </TableCell>
      <TableCell className="py-2 font-medium whitespace-normal sm:whitespace-nowrap">
        <div className="flex items-start sm:items-center gap-2 pl-[calc(var(--level)*var(--file-tree-indent-mobile))] sm:pl-[calc(var(--level)*var(--file-tree-indent-desktop))]" style={{ '--level': level } as React.CSSProperties}>
          <span className="shrink-0 mt-0.5 sm:mt-0">{getFileIcon(url)}</span>
          <span className="break-words sm:break-normal">{name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground py-2 hidden sm:table-cell">
        {size ? formatBytes(size) : "-"}
      </TableCell>
      <TableCell className="text-muted-foreground py-2 hidden sm:table-cell">
        {type ? type.toUpperCase() : date}
      </TableCell>
      <TableCell className="py-2 text-right whitespace-nowrap">
        {finalUrl && (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                href={`https://prev.hoa.moe?file=${encodeURIComponent(finalUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-4" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleDownload}
              disabled={isDownloading}
              className="hidden sm:inline-flex"
            >
              {isDownloading ? (
                <CircularProgress progress={progress} className="size-4" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
