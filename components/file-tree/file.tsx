"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { useFileTree } from "./ctx"
import { getFileIcon, formatBytes } from "./utils"
import { ExternalLinkIcon, DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
  const { level, path, selected, toggleSelect, isSelectable } = useFileTree()
  const icon = getFileIcon(name, type)
  const fullPath = path ? `${path}/${name}` : name
  const isSelected = selected.has(fullPath)

  return (
    <TableRow 
      className="hover:bg-muted/50 h-12"
      data-selected={isSelected || undefined}
    >
      <TableCell className="py-2 w-10">
        {isSelectable && (
          <input
            type="checkbox"
            className="accent-foreground size-3.5"
            checked={isSelected}
            onChange={() => toggleSelect(fullPath)}
            aria-label={`Select ${name}`}
          />
        )}
      </TableCell>
      <TableCell className="py-2 font-medium">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${Math.max(0, level - 1) * 1.5}rem` }}>
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground py-2">
        {type ? type.toUpperCase() : date}
      </TableCell>
      <TableCell className="text-muted-foreground py-2">
        {size ? formatBytes(size) : "-"}
      </TableCell>
      <TableCell className="py-2 text-right whitespace-nowrap">
        {url && (
            <>
              <Button variant="ghost" size="icon-sm" asChild>
                <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLinkIcon />
                </Link>
              </Button>
              <Button variant="ghost" size="icon-sm" asChild>
                <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <DownloadIcon />
                </a>
              </Button>
            </>
        )}
      </TableCell>
    </TableRow>
  )
}
