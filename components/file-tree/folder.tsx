"use client"

import { TableCell, TableRow } from "@/components/ui/table"
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
    } else if (hasMatch && !isSelfMatch) {
      setIsOpen(true)
    }
  }

  if (!hasMatch && !isSelfMatch) {
    return null
  }
  
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    selectBatch([fullPath, ...allIds], e.target.checked)
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
              <input
                type="checkbox"
                className="accent-foreground size-3.5"
                checked={isSelected}
                onChange={handleSelect}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${name}`}
              />
            </div>
          )}
        </TableCell>
        <TableCell className="py-2 font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
            <span className="shrink-0">
              {isOpen ? <FolderOpen className="size-4" /> : <FolderIcon className="size-4" />}
            </span>
            <span className="truncate">{name}</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground py-2">
          {size ? formatBytes(size) : "-"}
        </TableCell>
        <TableCell className="text-muted-foreground py-2">
          {date}
        </TableCell>
        <TableCell className="py-2 text-right" />
      </TableRow>
      {isOpen && children}
    </FileTreeContext.Provider>
  )
}
