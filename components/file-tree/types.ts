import { ReactNode } from "react"

export interface FileNode {
  id: string           // Full path as unique ID
  name: string
  type: "file" | "folder"
  url?: string
  size?: number
  date?: string
  fileType?: string
  depth: number        // For indentation
  children?: FileNode[]
  defaultOpen?: boolean
}

export interface FileProps {
  name: string
  url?: string
  size?: number
  date?: string
  type?: string
}

export interface FolderProps {
  name: string
  children?: ReactNode
  defaultOpen?: boolean | string
  date?: string
  size?: number
}

export interface DownloadFile {
  path: string
  url: string
  name: string
}
