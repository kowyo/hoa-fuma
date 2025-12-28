"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Folder as FolderIcon, FolderOpen } from "lucide-react"
import { useState, ReactNode, useMemo } from "react"
import { FileTreeContext, useFileTree } from "./ctx"
import { formatBytes } from "./utils"

export function Folder({ 
  name, 
  children, 
  defaultOpen = false,
  date = "-",
  size
}: { 
  name: string, 
  children: ReactNode, 
  defaultOpen?: boolean | string,
  date?: string,
  size?: number
}) {
  const { 
    level, 
    path, 
    selected, 
    toggleSelect, 
    selectBatch, 
    isSelectable, 
    searchQuery, 
    isAccelerated,
    getMetadata
  } = useFileTree()
  
  const [isOpen, setIsOpen] = useState(defaultOpen === true || defaultOpen === "true")
  const [prevSearchQuery, setPrevSearchQuery] = useState("")
  
  const fullPath = path ? `${path}/${name}` : name
  
  const { allIds, hasMatch } = useMemo(() => 
    getMetadata(children, fullPath), 
    [children, fullPath, getMetadata]
  )

  const isSelected = selected.has(fullPath)
  const isSelfMatch = searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true

  // Adjust state during render when searchQuery changes
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery)
    if (!searchQuery) {
      setIsOpen(defaultOpen === true || defaultOpen === "true")
    } else if (hasMatch) {
      setIsOpen(true)
    }
  }

  if (!hasMatch && !isSelfMatch) {
    return null
  }
  
  const handleSelect = (checked: boolean | "indeterminate") => {
    selectBatch([fullPath, ...allIds], !!checked)
  }

  return (
    <FileTreeContext.Provider value={{ 
      level: level + 1, 
      path: fullPath, 
      selected, 
      toggleSelect, 
      selectBatch, 
      isSelectable,
      searchQuery,
      isAccelerated,
      getMetadata
    }}>
      <TableRow 
        className="hover:bg-muted/50 cursor-pointer h-12" 
        onClick={() => setIsOpen(!isOpen)}
        data-selected={isSelected || undefined}
      >
        <TableCell className="w-10 py-2">
          {isSelectable && (
            <div className="flex items-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelect}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${name}`}
              />
            </div>
          )}
        </TableCell>
        <TableCell className="py-2 font-medium whitespace-normal sm:whitespace-nowrap">
          <div className="flex items-start sm:items-center gap-2 pl-[calc(var(--level)*var(--file-tree-indent-mobile))] sm:pl-[calc(var(--level)*var(--file-tree-indent-desktop))]" style={{ '--level': level } as React.CSSProperties}>
            <span className="shrink-0 mt-0.5 sm:mt-0">
              {isOpen ? <FolderOpen className="size-4 opacity-60" /> : <FolderIcon className="size-4 opacity-60" />}
            </span>
            <span className="break-words sm:break-normal sm:truncate">{name}</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground py-2 hidden sm:table-cell">
          {size ? formatBytes(size) : "-"}
        </TableCell>
        <TableCell className="text-muted-foreground py-2 hidden sm:table-cell">
          {date}
        </TableCell>
        <TableCell className="py-2 text-right" />
      </TableRow>
      {isOpen && children}
    </FileTreeContext.Provider>
  )
}
