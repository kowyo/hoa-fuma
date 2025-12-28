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

export function getFileExtension(url?: string) {
  if (!url) return ""
  try {
    const urlPath = new URL(url).pathname
    return decodeURIComponent(urlPath).split(".").pop()?.toLowerCase() || ""
  } catch {
    return ""
  }
}

export function getFileIcon(url?: string) {
  const ext = getFileExtension(url)
  const Icon = EXTENSION_MAP[ext] || FileIcon
  return <Icon className="size-4 opacity-60" aria-hidden="true" />
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function getAcceleratedUrl(url: string) {
  if (!url) return url
  const isExcluded = /\.(docx|pptx|xlsx)$/i.test(url)
  if (isExcluded) return url

  return url
    .replace("gh.hoa.moe/github.com", "gitea.osa.moe")
    .replace("/raw/", "/raw/branch/")
}
