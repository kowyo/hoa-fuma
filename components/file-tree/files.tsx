"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReactNode, useState, useMemo, useEffect, useRef, useCallback } from "react"
import { SearchIcon, UploadCloudIcon, DownloadIcon, ZapIcon, HardDrive } from "lucide-react"
import { FileTreeContext } from "./ctx"
import { cn } from "@/lib/utils"
import { getTreeMetadata, getAcceleratedUrl } from "./utils"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/ui/circular-progress"
import { downloadBatchFiles } from "@/lib/download"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function Files({ children, className, url }: { children: ReactNode, className?: string, url?: string }) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isAccelerated, setIsAccelerated] = useState(false)
  const checkboxRef = useRef<HTMLInputElement>(null)

  const { allIds, files, hasMatch } = useMemo(() => 
    getTreeMetadata(children, query), 
    [children, query]
  )

  const isAllSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
  const isIndeterminate = selected.size > 0 && !isAllSelected

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const toggleAll = () => {
    setSelected(isAllSelected ? new Set() : new Set(allIds))
  }

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectBatch = useCallback((ids: string[], shouldSelect: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach(id => {
        if (shouldSelect) next.add(id)
        else next.delete(id)
      })
      return next
    })
  }, [])

  const getMetadata = useCallback((nodes: ReactNode, path: string) => {
    return getTreeMetadata(nodes, query, path)
  }, [query])

  const handleBatchDownload = async () => {
    if (selected.size === 0) return
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const selectedFiles = files
        .filter(file => selected.has(file.path))
        .map(file => ({
          ...file,
          url: isAccelerated ? getAcceleratedUrl(file.url) : file.url
        }))

      await downloadBatchFiles(selectedFiles, setDownloadProgress)
    } catch (error: any) {
      console.error("Batch download failed:", error)
      toast.error(`下载失败: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full not-prose", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索"
              className="bg-background ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground h-8 w-56 rounded-md border px-7 text-[13px] outline-none focus-visible:ring-2"
              aria-label="Search files"
            />
            <SearchIcon
              className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 opacity-70"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={cn(
            "flex items-center gap-2 px-2.5 h-8 rounded-md transition-all border",
            isAccelerated 
              ? "bg-blue-500/5 border-blue-500/20 text-blue-600" 
              : "border-input text-muted-foreground bg-muted/50 hover:bg-background"
          )}>
            <ZapIcon className="size-4" />
            <Label 
              htmlFor="accelerate-mode" 
              className="text-[13px] font-medium cursor-pointer whitespace-nowrap"
            >
              校园网加速
            </Label>
            <Switch
              id="accelerate-mode"
              checked={isAccelerated}
              onCheckedChange={setIsAccelerated}
              className="scale-75 data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="hidden sm:flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3"
            >
              <UploadCloudIcon className="size-4 text-muted-foreground" />
              <span className="text-[13px]">上传文件</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <HardDrive className="size-4 text-muted-foreground" />
              <span className="text-[13px]">网盘计划</span>
            </a>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            disabled={selected.size === 0 || isDownloading}
            onClick={handleBatchDownload}
          >
            {isDownloading ? (
              <CircularProgress progress={downloadProgress} />
            ) : (
              <DownloadIcon className="size-4 text-muted-foreground" />
            )}
            <span className="text-[13px]">批量下载</span>
          </Button>
        </div>
      </div>

      <div className="bg-background overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="text-xs">
            <TableRow className="bg-muted/50 whitespace-nowrap">
              <TableHead className="h-9 w-10 py-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="accent-foreground size-3.5"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    ref={checkboxRef}
                    aria-label={isAllSelected ? "Unselect all" : "Select all"}
                  />
                </div>
              </TableHead>
              <TableHead className="h-9 py-2">文件名</TableHead>
              <TableHead className="h-9 py-2">文件大小</TableHead>
              <TableHead className="h-9 py-2">最后修改日期</TableHead>
              <TableHead className="h-9 w-0 py-2 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[13px]">
            <FileTreeContext.Provider value={{ 
              level: 0, 
              path: "", 
              selected, 
              toggleSelect, 
              selectBatch, 
              isSelectable: true, 
              searchQuery: query, 
              isAccelerated,
              getMetadata
            }}>
              {hasMatch ? children : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    未找到相关文件
                  </TableCell>
                </TableRow>
              )}
            </FileTreeContext.Provider>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
