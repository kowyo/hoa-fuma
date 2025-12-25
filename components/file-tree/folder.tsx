"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Folder as FolderIcon, FolderOpen } from "lucide-react"
import { useState, ReactNode, useMemo, useEffect } from "react"
import { FileTreeContext, useFileTree } from "./ctx"
import { formatBytes, collectIds, hasMatch } from "./utils"

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
  const { level, path, selected, toggleSelect, selectBatch, isSelectable, searchQuery, isAccelerated } = useFileTree()
  const [isOpen, setIsOpen] = useState(defaultOpen === true || defaultOpen === "true")
  
  const fullPath = path ? `${path}/${name}` : name
  const allChildIds = useMemo(() => collectIds(children, fullPath), [children, fullPath])
  const isSelected = selected.has(fullPath)

  const selfMatch = searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  const childMatch = useMemo(() => hasMatch(children, searchQuery), [children, searchQuery])

  useEffect(() => {
    if (searchQuery && childMatch) {
      setIsOpen(true)
    }
  }, [searchQuery, childMatch])

  if (searchQuery && !selfMatch && !childMatch) {
    return null
  }
  
  const handleSelect = () => {
    const shouldSelect = !isSelected
    // Select/deselect folder and all children
    selectBatch([fullPath, ...allChildIds], shouldSelect)
  }

  return (
    <FileTreeContext.Provider value={{ 
      level: level + 1, 
      path: fullPath, 
      selected, 
      toggleSelect, 
      selectBatch, 
      isSelectable,
      searchQuery: selfMatch ? "" : searchQuery,
      isAccelerated
    }}>
      <TableRow 
        className="hover:bg-muted/50 cursor-pointer h-12" 
        onClick={() => setIsOpen(!isOpen)}
        data-selected={isSelected || undefined}
      >
        <TableCell className="py-2 w-10" onClick={(e) => e.stopPropagation()}>
          {isSelectable && (
            <div className="flex items-center h-full">
              <input
                type="checkbox"
                className="accent-foreground size-3.5"
                checked={isSelected}
                onChange={handleSelect}
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
        <TableCell className="py-2 text-right whitespace-nowrap">
        </TableCell>
      </TableRow>
      {isOpen && children}
    </FileTreeContext.Provider>
  )
}
