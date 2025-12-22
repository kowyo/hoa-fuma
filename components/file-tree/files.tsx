"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReactNode, useState, Children, isValidElement, useMemo, ReactElement, useEffect, useRef } from "react"
import { SearchIcon, UploadCloudIcon, DownloadIcon } from "lucide-react"
import { FileTreeContext } from "./ctx"
import { collectIds } from "./utils"
import { Button } from "@/components/ui/button"

export function Files({ children, className }: { children: ReactNode, className?: string }) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const checkboxRef = useRef<HTMLInputElement>(null)

  const allIds = useMemo(() => collectIds(children), [children])
  const isAllSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
  const isIndeterminate = selected.size > 0 && !isAllSelected

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const toggleAll = () => {
    if (isAllSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectBatch = (ids: string[], shouldSelect: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach(id => {
        if (shouldSelect) next.add(id)
        else next.delete(id)
      })
      return next
    })
  }

  // Helper to count files (best effort)
  const fileCount = useMemo(() => {
    let count = 0
    const traverse = (nodes: ReactNode) => {
      Children.forEach(nodes, (child) => {
        if (!isValidElement(child)) return
        // Heuristic: if it has "children" prop, it's likely a folder, otherwise a file
        // Or check if it has a "name" prop.
        const element = child as ReactElement<{ children?: ReactNode }>
        if (element.props.children) {
          traverse(element.props.children)
        } else {
          count++
        }
      })
    }
    traverse(children)
    return count
  }, [children])

  return (
    <div className={`flex flex-col gap-3 w-full not-prose ${className || ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">
            Files <span className="text-muted-foreground">({fileCount})</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <div className="ms-2 hidden sm:flex gap-2">
            <Button variant="outline" size="sm">
              <UploadCloudIcon />
              上传文件
            </Button>
          </div>
          <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selected.size === 0}
              >
                <DownloadIcon />
                批量下载
              </Button>
          </div>
        </div>
      </div>

      <div className="bg-background overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="text-xs">
            <TableRow className="bg-muted/50 whitespace-nowrap">
              <TableHead className="h-9 w-10 py-2">
                <input
                  type="checkbox"
                  className="accent-foreground size-3.5"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  ref={checkboxRef}
                  aria-label={isAllSelected ? "Unselect all" : "Select all"}
                />
              </TableHead>
              <TableHead className="h-9 py-2">文件名</TableHead>
              <TableHead className="h-9 py-2">最后修改日期</TableHead>
              <TableHead className="h-9 py-2">文件大小</TableHead>
              <TableHead className="h-9 w-0 py-2 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[13px]">
            <FileTreeContext.Provider value={{ level: 0, path: "", selected, toggleSelect, selectBatch, isSelectable: true }}>
              {children}
            </FileTreeContext.Provider>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
