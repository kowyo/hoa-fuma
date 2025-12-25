"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { useFileTree } from "./ctx"
import { getFileIcon, formatBytes, getAcceleratedUrl } from "./utils"
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
  const icon = getFileIcon(name, type)
  const fullPath = path ? `${path}/${name}` : name
  const isSelected = selected.has(fullPath)

  const finalUrl = url && isAccelerated ? getAcceleratedUrl(url) : url

  const handleDownload = async (e: React.MouseEvent) => {
    if (!finalUrl) return
    e.preventDefault()
    setIsDownloading(true)
    setProgress(0)

    try {
      await downloadSingleFile(finalUrl, name, (p) => setProgress(p))
    } catch (error: any) {
      console.error("Download failed:", error)
      toast.error(`下载失败: ${error.message}`)
    } finally {
      setIsDownloading(false)
      setProgress(0)
    }
  }

  if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null
  }

  return (
    <TableRow 
      className="hover:bg-muted/50 h-12"
      data-selected={isSelected || undefined}
    >
      <TableCell className="py-2 w-10">
        {isSelectable && (
          <div className="flex items-center h-full">
            <input
              type="checkbox"
              className="accent-foreground size-3.5"
              checked={isSelected}
              onChange={() => toggleSelect(fullPath)}
              aria-label={`Select ${name}`}
            />
          </div>
        )}
      </TableCell>
      <TableCell className="py-2 font-medium">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${Math.max(0, level - 1) * 1.5}rem` }}>
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground py-2">
        {size ? formatBytes(size) : "-"}
      </TableCell>
      <TableCell className="text-muted-foreground py-2">
        {type ? type.toUpperCase() : date}
      </TableCell>
      <TableCell className="py-2 text-right whitespace-nowrap">
        {finalUrl && (
            <>
              <Button variant="ghost" size="icon-sm" asChild>
                <Link
                    href={`https://prev.hoa.moe?file=${encodeURIComponent(finalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLinkIcon />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <CircularProgress progress={progress} size={16} />
                ) : (
                  <DownloadIcon />
                )}
              </Button>
            </>
        )}
      </TableCell>
    </TableRow>
  )
}
