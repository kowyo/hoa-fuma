"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/ui/circular-progress"
import { 
  ExternalLinkIcon, 
  DownloadIcon,
  Folder,
  FolderOpen,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { FileNode } from "./types"
import { getFileIcon, getAcceleratedUrl, formatBytes } from "./utils"
import { downloadSingleFile } from "./utils"

interface ColumnOptions {
  isAccelerated: boolean
}

// Cell component for file/folder name with indentation and expand toggle
function NameCell({ 
  row, 
}: { 
  row: Row<FileNode>
}) {
  const node = row.original
  const isFolder = node.type === "folder"
  const isExpanded = row.getIsExpanded()

  return (
    <div 
      className="flex items-start sm:items-center gap-2 pl-[calc(var(--depth)*var(--file-tree-indent-mobile))] sm:pl-[calc(var(--depth)*var(--file-tree-indent-desktop))]" 
      style={{ '--depth': node.depth } as React.CSSProperties}
    >
      {isFolder ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          className="shrink-0 mt-1 sm:mt-0 flex items-center"
        >
          {isExpanded ? (
            <FolderOpen className="size-4 opacity-60" />
          ) : (
            <Folder className="size-4 opacity-60" />
          )}
        </button>
      ) : (
        <span className="shrink-0 mt-1 sm:mt-0">{getFileIcon(node.url)}</span>
      )}
      <span className="flex-1 text-wrap break-normal min-w-0">{node.name}</span>
    </div>
  )
}

// Cell component for actions (preview, download)
function ActionsCell({ 
  row, 
  isAccelerated 
}: { 
  row: Row<FileNode>
  isAccelerated: boolean
}) {
  const node = row.original
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  if (node.type === "folder" || !node.url) {
    return null
  }

  const finalUrl = isAccelerated ? getAcceleratedUrl(node.url) : node.url

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDownloading(true)
    setProgress(0)

    try {
      await downloadSingleFile(finalUrl, node.name, setProgress)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("Download failed:", error)
      toast.error(`下载失败: ${message}`)
    } finally {
      setIsDownloading(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link
          href={`https://prev.hoa.moe?file=${encodeURIComponent(finalUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
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
  )
}

// Checkbox cell for row selection
function SelectCell({ row }: { row: Row<FileNode> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Select ${row.original.name}`}
    />
  )
}

export function createColumns(options: ColumnOptions): ColumnDef<FileNode>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => <SelectCell row={row} />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: "文件名",
      cell: ({ row }) => <NameCell row={row} />,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        const name = row.getValue(columnId) as string
        return name.toLowerCase().includes(filterValue.toLowerCase())
      },
      meta: {
        className: "whitespace-normal min-w-0",
      },
    },
    {
      accessorKey: "size",
      header: "文件大小",
      cell: ({ row }) => {
        const size = row.getValue("size") as number | undefined
        return (
          <span className="text-muted-foreground">
            {size ? formatBytes(size) : "-"}
          </span>
        )
      },
      meta: {
        className: "hidden sm:table-cell",
      },
    },
    {
      accessorKey: "date",
      header: "最后修改日期",
      cell: ({ row }) => {
        const node = row.original
        return (
          <span className="text-muted-foreground">
            {node.date || "-"}
          </span>
        )
      },
      meta: {
        className: "hidden sm:table-cell",
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionsCell row={row} isAccelerated={options.isAccelerated} />
      ),
      size: 80,
    },
  ]
}

