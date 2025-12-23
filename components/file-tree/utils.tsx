import {
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon,
} from "lucide-react"
import React, { Children, isValidElement, ReactElement, ReactNode } from "react"

export function collectIds(nodes: ReactNode, parentPath: string = ""): string[] {
  const ids: string[] = []
  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return
    const element = child as ReactElement<{ name?: string; children?: ReactNode }>
    
    const name = element.props.name
    if (!name) return

    const fullPath = parentPath ? `${parentPath}/${name}` : name
    ids.push(fullPath)
    
    if (element.props.children) {
      ids.push(...collectIds(element.props.children, fullPath))
    }
  })
  return ids
}

export function hasMatch(nodes: ReactNode, query: string): boolean {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()
  let match = false
  Children.forEach(nodes, (child) => {
    if (match || !isValidElement(child)) return
    const props = child.props as { name?: string; children?: ReactNode }
    if (props.name?.toLowerCase().includes(normalizedQuery)) {
      match = true
      return
    }
    if (props.children && hasMatch(props.children, query)) {
      match = true
    }
  })
  return match
}

export function getFileIcon(name: string, type: string = "") {
  const ext = name.split(".").pop()?.toLowerCase() || ""

  if (
    type.includes("pdf") ||
    ext === "pdf" ||
    type.includes("word") ||
    ext === "doc" ||
    ext === "docx" ||
    type.includes("text") ||
    ext === "txt" ||
    ext === "md" ||
    ext === "mdx" ||
    ext === "tsx" ||
    ext === "jsx" ||
    ext === "ts" ||
    ext === "js" ||
    ext === "json" ||
    ext === "css"
  ) {
    return <FileTextIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  if (
    type.includes("zip") ||
    type.includes("archive") ||
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar"
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  if (
    type.includes("excel") ||
    ext === "xls" ||
    ext === "xlsx" ||
    ext === "csv"
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  if (type.startsWith("video/") || ["mp4", "mov", "webm", "mkv"].includes(ext)) {
    return <VideoIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  if (type.startsWith("audio/") || ["mp3", "wav", "flac", "m4a"].includes(ext)) {
    return <HeadphonesIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return <ImageIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  return <FileIcon className="size-4 opacity-60" aria-hidden="true" />
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}
