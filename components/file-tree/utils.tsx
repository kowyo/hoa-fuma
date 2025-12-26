import {
  FileArchive,
  FileIcon,
  FileSpreadsheet,
  FileTextIcon,
  FileHeadphone,
  FileImage,
  FilePlay,
  FileChartPie,
  LucideIcon,
} from "lucide-react"
import React, { Children, isValidElement, ReactElement, ReactNode } from "react"

export interface TreeFile {
  path: string
  url: string
  name: string
}

export interface TreeMetadata {
  allIds: string[]
  files: TreeFile[]
  hasMatch: boolean
}

/**
 * Consolidated tree traversal to collect IDs, files, and check for matches in one pass.
 */
export function getTreeMetadata(nodes: ReactNode, query: string = "", parentPath: string = ""): TreeMetadata {
  const allIds: string[] = []
  const files: TreeFile[] = []
  const normalizedQuery = query.toLowerCase()
  let hasVisibleNode = false

  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return
    
    // Type assertion for children props
    const element = child as ReactElement<{ name: string; url?: string; children?: ReactNode }>
    const { name, url, children } = element.props
    if (!name) return

    const fullPath = parentPath ? `${parentPath}/${name}` : name
    const isSelfMatch = normalizedQuery ? name.toLowerCase().includes(normalizedQuery) : true
    const queryForChildren = isSelfMatch ? "" : query
    const childMetadata = children ? getTreeMetadata(children, queryForChildren, fullPath) : null
    const hasDescendantMatch = childMetadata?.hasMatch ?? false
    const isVisible = query ? (isSelfMatch || hasDescendantMatch) : true

    if (isVisible) {
      allIds.push(fullPath)
      hasVisibleNode = true
    }

    if (url && isVisible) {
      files.push({ path: fullPath, url, name })
    }

    if (childMetadata) {
      allIds.push(...childMetadata.allIds)
      files.push(...childMetadata.files)
    }
  })

  return { allIds, files, hasMatch: hasVisibleNode }
}

export function getAcceleratedUrl(url: string) {
  if (!url) return url
  const isExcluded = /\.(docx|pptx|xlsx)$/i.test(url)
  if (isExcluded) return url

  return url
    .replace("gh.hoa.moe/github.com", "gitea.osa.moe")
    .replace("/raw/", "/raw/branch/")
}

const EXTENSION_MAP: Record<string, LucideIcon> = {
  pdf: FileTextIcon,
  doc: FileTextIcon,
  docx: FileTextIcon,
  txt: FileTextIcon,
  md: FileTextIcon,
  mdx: FileTextIcon,
  ppt: FileChartPie,
  pptx: FileChartPie,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  zip: FileArchive,
  rar: FileArchive,
  "7z": FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  mp4: FilePlay,
  mov: FilePlay,
  webm: FilePlay,
  mkv: FilePlay,
  mp3: FileHeadphone,
  wav: FileHeadphone,
  flac: FileHeadphone,
  m4a: FileHeadphone,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  webp: FileImage,
  svg: FileImage,
}

export function getFileIcon(url?: string) {
  if (!url) return <FileIcon className="size-4" aria-hidden="true" />
  
  try {
    const urlPath = new URL(url).pathname
    const ext = decodeURIComponent(urlPath).split(".").pop()?.toLowerCase() || ""
    const Icon = EXTENSION_MAP[ext] || FileIcon
    return <Icon className="size-4" aria-hidden="true" />
  } catch {
    return <FileIcon className="size-4" aria-hidden="true" />
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
