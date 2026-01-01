import { Children, isValidElement, ReactElement, ReactNode } from "react"
import { zip, type AsyncZippable } from "fflate"
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
import type { FileNode, FileProps, FolderProps, DownloadFile } from "./types"

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

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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

export function getAcceleratedUrl(url: string) {
  if (!url) return url
  const isExcluded = /\.(docx|pptx|xlsx)$/i.test(url)
  if (isExcluded) return url

  return url
    .replace("gh.hoa.moe/github.com", "gitea.osa.moe")
    .replace("/raw/", "/raw/branch/")
}

/**
 * Transforms React children (declarative MDX structure) into a flat array of FileNode objects.
 */
export function transformChildrenToData(
  nodes: ReactNode,
  parentPath: string = "",
  depth: number = 0
): FileNode[] {
  const result: FileNode[] = []

  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return

    const element = child as ReactElement<FileProps | FolderProps>
    const { name } = element.props
    if (!name) return

    const fullPath = parentPath ? `${parentPath}/${name}` : name

    // Check if it's a folder (has children prop that contains more nodes)
    const children = (element.props as FolderProps).children
    const isFolder = children !== undefined

    if (isFolder) {
      const folderProps = element.props as FolderProps
      const childNodes = transformChildrenToData(children, fullPath, depth + 1)
      
      result.push({
        id: fullPath,
        name,
        type: "folder",
        depth,
        date: folderProps.date,
        size: folderProps.size,
        defaultOpen: folderProps.defaultOpen === true || folderProps.defaultOpen === "true",
        children: childNodes.length > 0 ? childNodes : undefined,
      })
    } else {
      const fileProps = element.props as FileProps
      result.push({
        id: fullPath,
        name,
        type: "file",
        url: fileProps.url,
        size: fileProps.size,
        date: fileProps.date,
        fileType: fileProps.type,
        depth,
      })
    }
  })

  return result
}

/**
 * Flattens the hierarchical FileNode tree into a single array.
 */
export function flattenNodes(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  
  function traverse(items: FileNode[]) {
    for (const node of items) {
      result.push(node)
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return result
}

/**
 * Gets all file nodes (non-folders) from the tree.
 */
export function getFileNodes(nodes: FileNode[]): FileNode[] {
  return flattenNodes(nodes).filter(node => node.type === "file" && node.url)
}

/**
 * Trigger a browser download for a blob
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Downloads a single file with progress tracking
 */
export async function downloadSingleFile(
  url: string,
  name: string,
  onProgress?: (progress: number) => void
) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (total === 0 || !response.body) {
    const blob = await response.blob();
    triggerDownload(blob, name);
    onProgress?.(100);
    return;
  }

  const reader = response.body.getReader();
  let receivedLength = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedLength += value.length;
      onProgress?.(Math.round((receivedLength / total) * 100));
    }
  }

  const blob = new Blob(chunks as BlobPart[]);
  triggerDownload(blob, name);
}

/**
 * Downloads multiple files as a ZIP archive with progress tracking
 */
export async function downloadBatchFiles(
  files: DownloadFile[],
  onProgress?: (progress: number) => void
) {
  const zippable: AsyncZippable = {};
  let completed = 0;

  await Promise.all(
    files.map(async (file) => {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error(`Failed to fetch ${file.url}: ${response.statusText}`);
      
      const buffer = await response.arrayBuffer();
      
      // Ensure extension is preserved if missing in path but present in URL
      let zipPath = file.path;
      const urlPath = file.url.split(/[?#]/)[0];
      const extMatch = urlPath.match(/\.[a-z0-9]+$/i);
      
      if (extMatch && !zipPath.toLowerCase().endsWith(extMatch[0].toLowerCase())) {
        zipPath += extMatch[0];
      }

      zippable[zipPath] = new Uint8Array(buffer);
      completed++;
      onProgress?.(Math.round((completed / files.length) * 90));
    })
  );

  if (Object.keys(zippable).length === 0) {
    throw new Error("No files were successfully downloaded");
  }

  const content = await new Promise<Uint8Array>((resolve, reject) => {
    zip(zippable, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  onProgress?.(100);
  const blob = new Blob([content as BlobPart], { type: "application/zip" });
  triggerDownload(blob, `batch-download-${Date.now()}.zip`);
}
