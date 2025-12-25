import {
  FileArchive,
  FileIcon,
  FileSpreadsheet,
  FileTextIcon,
  FileHeadphone,
  FileImage,
  FilePlay,
  FileChartPie,
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

export function collectFilesWithUrls(nodes: ReactNode, parentPath: string = ""): { path: string, url: string }[] {
  const files: { path: string, url: string }[] = []
  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return
    const element = child as ReactElement<{ name?: string; url?: string; children?: ReactNode }>
    
    const name = element.props.name
    if (!name) return

    const fullPath = parentPath ? `${parentPath}/${name}` : name
    if (element.props.url) {
      files.push({ path: fullPath, url: element.props.url })
    }
    
    if (element.props.children) {
      files.push(...collectFilesWithUrls(element.props.children, fullPath))
    }
  })
  return files
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

export function getAcceleratedUrl(url: string) {
  if (!url) return url
  const isExcluded = url.endsWith(".docx") || url.endsWith(".pptx") || url.endsWith(".xlsx")
  if (isExcluded) return url

  let newUrl = url.replace("gh.hoa.moe/github.com", "gitea.osa.moe")
  newUrl = newUrl.replace("/raw/", "/raw/branch/")
  return newUrl
}

export function getFileIcon(url: string) {
  const urlPath = new URL(url).pathname
  const urlDecoded = decodeURIComponent(urlPath)
  const ext = urlDecoded.split(".").pop()?.toLowerCase() || ""

  // PDF files
  if (ext === "pdf") {
    return <FileTextIcon className="size-4 opacity-60" aria-hidden="true" />
  }

  // Word documents
  if (ext === "doc" || ext === "docx") {
    return <FileTextIcon className="size-4 opacity-60" aria-hidden="true" />
  }

  // PowerPoint presentations
  if (ext === "ppt" || ext === "pptx") {
    return <FileChartPie className="size-4 opacity-60" aria-hidden="true" />
  }

  // Excel/Spreadsheet files
  if (ext === "xls" || ext === "xlsx" || ext === "csv") {
    return <FileSpreadsheet className="size-4 opacity-60" aria-hidden="true" />
  }

  // Archive files
  if (ext === "zip" || ext === "rar" || ext === "7z" || ext === "tar" || ext === "gz") {
    return <FileArchive className="size-4 opacity-60" aria-hidden="true" />
  }

  // Video files
  if (["mp4", "mov", "webm", "mkv", "avi", "flv", "wmv"].includes(ext)) {
    return <FilePlay className="size-4 opacity-60" aria-hidden="true" />
  }

  // Audio files
  if (["mp3", "wav", "flac", "m4a", "aac", "ogg", "wma"].includes(ext)) {
    return <FileHeadphone className="size-4 opacity-60" aria-hidden="true" />
  }

  // Image files
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    return <FileImage className="size-4 opacity-60" aria-hidden="true" />
  }

  // Text files and code files
  if (["txt", "md", "mdx", "tsx", "jsx", "ts", "js", "json", "css", "html", "xml", "yaml", "yml"].includes(ext)) {
    return <FileTextIcon className="size-4 opacity-60" aria-hidden="true" />
  }

  // Default file icon
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
