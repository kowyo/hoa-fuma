import { createContext, useContext } from "react"
import { TreeMetadata } from "./utils"

interface FileTreeContextValue {
  level: number
  path: string
  selected: Set<string>
  toggleSelect: (id: string) => void
  selectBatch: (ids: string[], selected: boolean) => void
  isSelectable: boolean
  searchQuery: string
  isAccelerated: boolean
  // New helper to avoid redundant traversals
  getMetadata: (nodes: React.ReactNode, path: string) => TreeMetadata
}

export const FileTreeContext = createContext<FileTreeContextValue>({
  level: 0,
  path: "",
  selected: new Set(),
  toggleSelect: () => {},
  selectBatch: () => {},
  isSelectable: false,
  searchQuery: "",
  isAccelerated: false,
  getMetadata: () => ({ allIds: [], files: [], hasMatch: true }),
})

export function useFileTree() {
  return useContext(FileTreeContext)
}
