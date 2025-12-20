"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CheckIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  SearchIcon,
  UploadCloudIcon,
  UploadIcon,
  VideoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from "react"

export type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
}

export type FileUploadOptions = {
  maxFiles?: number // Only used when multiple is true, defaults to Infinity
  maxSize?: number // in bytes
  accept?: string
  multiple?: boolean // Defaults to false
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void // Callback when files change
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void // Callback when new files are added
}

export type FileUploadState = {
  files: FileWithPreview[]
  isDragging: boolean
  errors: string[]
}

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void
  clearFiles: () => void
  clearErrors: () => void
  handleDragEnter: (e: DragEvent<HTMLElement>) => void
  handleDragLeave: (e: DragEvent<HTMLElement>) => void
  handleDragOver: (e: DragEvent<HTMLElement>) => void
  handleDrop: (e: DragEvent<HTMLElement>) => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>
  }
}

export const useFileUpload = (
  options: FileUploadOptions = {}
): [FileUploadState, FileUploadActions] => {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = "*",
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
  } = options

  const [state, setState] = useState<FileUploadState>({
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
    })),
    isDragging: false,
    errors: [],
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file instanceof File) {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`
        }
      } else {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`
        }
      }

      if (accept !== "*") {
        const acceptedTypes = accept.split(",").map((type) => type.trim())
        const fileType = file instanceof File ? file.type || "" : file.type
        const fileExtension = `.${file instanceof File ? file.name.split(".").pop() : file.name.split(".").pop()}`

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension.toLowerCase() === type.toLowerCase()
          }
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0]
            return fileType.startsWith(`${baseType}/`)
          }
          return fileType === type
        })

        if (!isAccepted) {
          return `File "${file instanceof File ? file.name : file.name}" is not an accepted file type.`
        }
      }

      return null
    },
    [accept, maxSize]
  )

  const createPreview = useCallback(
    (file: File | FileMetadata): string | undefined => {
      if (file instanceof File) {
        return URL.createObjectURL(file)
      }
      return file.url
    },
    []
  )

  const generateUniqueId = useCallback((file: File | FileMetadata): string => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    return file.id
  }, [])

  const clearFiles = useCallback(() => {
    setState((prev) => {
      // Clean up object URLs
      prev.files.forEach((file) => {
        if (
          file.preview &&
          file.file instanceof File &&
          file.file.type.startsWith("image/")
        ) {
          URL.revokeObjectURL(file.preview)
        }
      })

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      const newState = {
        ...prev,
        files: [],
        errors: [],
      }

      onFilesChange?.(newState.files)
      return newState
    })
  }, [onFilesChange])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      if (!newFiles || newFiles.length === 0) return

      const newFilesArray = Array.from(newFiles)
      const errors: string[] = []

      // Clear existing errors when new files are uploaded
      setState((prev) => ({ ...prev, errors: [] }))

      // In single file mode, clear existing files first
      if (!multiple) {
        clearFiles()
      }

      // Check if adding these files would exceed maxFiles (only in multiple mode)
      if (
        multiple &&
        maxFiles !== Infinity &&
        state.files.length + newFilesArray.length > maxFiles
      ) {
        errors.push(`You can only upload a maximum of ${maxFiles} files.`)
        setState((prev) => ({ ...prev, errors }))
        return
      }

      const validFiles: FileWithPreview[] = []

      newFilesArray.forEach((file) => {
        // Only check for duplicates if multiple files are allowed
        if (multiple) {
          const isDuplicate = state.files.some(
            (existingFile) =>
              existingFile.file.name === file.name &&
              existingFile.file.size === file.size
          )

          // Skip duplicate files silently
          if (isDuplicate) {
            return
          }
        }

        // Check file size
        if (file.size > maxSize) {
          errors.push(
            multiple
              ? `Some files exceed the maximum size of ${formatBytes(maxSize)}.`
              : `File exceeds the maximum size of ${formatBytes(maxSize)}.`
          )
          return
        }

        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push({
            file,
            id: generateUniqueId(file),
            preview: createPreview(file),
          })
        }
      })

      // Only update state if we have valid files to add
      if (validFiles.length > 0) {
        // Call the onFilesAdded callback with the newly added valid files
        onFilesAdded?.(validFiles)

        setState((prev) => {
          const newFiles = !multiple
            ? validFiles
            : [...prev.files, ...validFiles]
          onFilesChange?.(newFiles)
          return {
            ...prev,
            files: newFiles,
            errors,
          }
        })
      } else if (errors.length > 0) {
        setState((prev) => ({
          ...prev,
          errors,
        }))
      }

      // Reset input value after handling files
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    [
      state.files,
      maxFiles,
      multiple,
      maxSize,
      validateFile,
      createPreview,
      generateUniqueId,
      clearFiles,
      onFilesChange,
      onFilesAdded,
    ]
  )

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: [],
    }))
  }, [])

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }

    setState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setState((prev) => ({ ...prev, isDragging: false }))

      // Don't process files if the input is disabled
      if (inputRef.current?.disabled) {
        return
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // In single file mode, only use the first file
        if (!multiple) {
          const file = e.dataTransfer.files[0]
          addFiles([file])
        } else {
          addFiles(e.dataTransfer.files)
        }
      }
    },
    [addFiles, multiple]
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
      }
    },
    [addFiles]
  )

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => {
      return {
        ...props,
        type: "file" as const,
        onChange: handleFileChange,
        accept: props.accept || accept,
        multiple: props.multiple !== undefined ? props.multiple : multiple,
        ref: inputRef,
      }
    },
    [accept, multiple, handleFileChange]
  )

  return [
    state,
    {
      addFiles,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
  ]
}

// Helper function to format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}


// ---------- Demo initial files (safe to remove) ----------
const initialFiles = [
  {
    name: "brochure.pdf",
    size: 528737,
    type: "application/pdf",
    url: "https://originui.com",
    id: "brochure.pdf-1744638436563-8u5xuls",
  },
  {
    name: "cover.png",
    size: 182873,
    type: "image/png",
    url: "https://originui.com",
    id: "cover.png-1744638436563-8u5xuls",
  },
  {
    name: "report.xlsx",
    size: 352873,
    type: "xlsx",
    url: "https://originui.com",
    id: "report.xlsx-1744638436563-8u5xuls",
  },
] satisfies {
  name: string
  size: number
  type: string
  url?: string
  id: string
}[]

// ---------- Types ----------
type UploadEntry = {
  id: string
  file: File | { name: string; type: string; size: number }
  preview?: string // object URL or remote URL injected by hook
}

// ---------- Utilities ----------
const isRealFile = (f: unknown): f is File =>
  typeof window !== "undefined" && typeof File !== "undefined" && f instanceof File

const getName = (e: UploadEntry) => (isRealFile(e.file) ? e.file.name : e.file.name)
const getType = (e: UploadEntry) => (isRealFile(e.file) ? e.file.type : e.file.type || "")
const getSize = (e: UploadEntry) => (isRealFile(e.file) ? e.file.size : e.file.size ?? 0)

const getExt = (name: string) => {
  const dot = name.lastIndexOf(".")
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : ""
}

const getPreviewUrl = (e: UploadEntry) => {
  // prefer preview; fall back to any url that the hook might have placed on entry
  return e.preview || (e as unknown as { url?: string }).url || ""
}

const niceSubtype = (mime: string) => {
  if (!mime) return "UNKNOWN"
  const parts = mime.split("/")
  return (parts[1] || parts[0] || "unknown").toUpperCase()
}

const getFileIcon = (entry: UploadEntry) => {
  const name = getName(entry)
  const type = getType(entry)
  const ext = getExt(name)

  if (
    type.includes("pdf") ||
    ext === "pdf" ||
    type.includes("word") ||
    ext === "doc" ||
    ext === "docx" ||
    type.includes("text") ||
    ext === "txt" ||
    ext === "md"
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
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    return <ImageIcon className="size-4 opacity-60" aria-hidden="true" />
  }
  return <FileIcon className="size-4 opacity-60" aria-hidden="true" />
}

// ---------- Component ----------
export default function FileUpload() {
  // Tunables
  const maxSize = 20 * 1024 * 1024 // 20MB
  const maxFiles = 20
  const [query, setQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"name" | "type" | "size">("name")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [copied, setCopied] = React.useState<string | null>(null)

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    initialFiles,
    // You can add `accept` here if your hook supports it
    // accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
  })

  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1200)
    return () => clearTimeout(t)
  }, [copied])

  const totalSize = React.useMemo(
    () => files.reduce((acc, f) => acc + getSize(f as UploadEntry), 0),
    [files]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? files.filter((f: UploadEntry) => {
          const name = getName(f).toLowerCase()
          const type = getType(f).toLowerCase()
          const ext = getExt(name)
          return name.includes(q) || type.includes(q) || ext.includes(q)
        })
      : files

    const sorter = (a: UploadEntry, b: UploadEntry) => {
      let cmp = 0
      if (sortBy === "name") {
        cmp = getName(a).localeCompare(getName(b))
      } else if (sortBy === "type") {
        cmp = getType(a).localeCompare(getType(b))
      } else {
        cmp = getSize(a) - getSize(b)
      }
      return sortDir === "asc" ? cmp : -cmp
    }

    return [...base].sort(sorter)
  }, [files, query, sortBy, sortDir])

  const allSelected = selected.size > 0 && filtered.every((f) => selected.has(f.id))
  const noneSelected = selected.size === 0

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((prev) => {
      if (filtered.length === 0) return prev
      const everySelected = filtered.every((f) => prev.has(f.id))
      if (everySelected) return new Set()
      return new Set(filtered.map((f) => f.id))
    })

  const downloadOne = (entry: UploadEntry) => {
    const url = getPreviewUrl(entry)
    if (!url) return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const downloadSelected = () => {
    filtered.forEach((f) => {
      if (selected.has(f.id)) downloadOne(f as UploadEntry)
    })
  }

  return (
    <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
      {/* -- Top toolbar -- */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">
            Files <span className="text-muted-foreground">({files.length})</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索"
              className="bg-background ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground h-8 w-56 rounded-md border px-7 text-[13px] outline-none focus-visible:ring-[2px]"
              aria-label="Search files"
            />
            <SearchIcon
              className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 opacity-70"
              aria-hidden="true"
            />
          </div>

          <div className="ms-2 hidden sm:flex gap-2">
            <Button variant="outline" size="sm" onClick={openFileDialog}>
              <UploadCloudIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
              上传文件
            </Button>
          </div>
          <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSelected}
                disabled={noneSelected}
                aria-disabled={noneSelected}
                title={noneSelected ? "Select files to download" : "Download selected"}
              >
                <DownloadIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
                批量下载
              </Button>
          </div>
        </div>
      </div>

      {/* -- When we have files -- */}
      {filtered.length > 0 ? (
        <>
          <div className="bg-background overflow-hidden rounded-md border">
            <Table>
                <TableHeader className="text-xs">
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-9 w-10 py-2">
                      <input
                        type="checkbox"
                        className="accent-foreground size-3.5"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label={allSelected ? "Unselect all" : "Select all"}
                      />
                    </TableHead>
                    <TableHead className="h-9 py-2">文件名</TableHead>
                    <TableHead className="h-9 py-2">最后修改日期</TableHead>
                    <TableHead className="h-9 py-2">文件大小</TableHead>
                    <TableHead className="h-9 w-0 py-2 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[13px]">
                  {filtered.map((entry: UploadEntry) => {
                    const name = getName(entry)
                    const type = getType(entry)
                    const size = getSize(entry)
                    const url = getPreviewUrl(entry)
                    const isSelected = selected.has(entry.id)
                    const percentOfMax = Math.min(100, Math.round((size / maxSize) * 100))

                    return (
                      <TableRow key={entry.id} data-selected={isSelected || undefined}>
                        <TableCell className="py-2">
                          <input
                            type="checkbox"
                            className="accent-foreground size-3.5"
                            checked={isSelected}
                            onChange={() => toggleOne(entry.id)}
                            aria-label={`Select ${name}`}
                          />
                        </TableCell>
                        <TableCell className="max-w-64 py-2 font-medium">
                          <span className="flex items-center gap-2">
                            <span className="shrink-0">{getFileIcon(entry)}</span>
                            <span className="truncate">{name}</span>
                          </span>
                          {/* Size bar */}
                          <div className="mt-1 h-1.5 w-44 overflow-hidden rounded bg-muted/50">
                            <div
                              className="h-full bg-foreground/60"
                              style={{ width: `${percentOfMax}%` }}
                              aria-hidden="true"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2">
                          {niceSubtype(type)}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2">
                          {formatBytes(size)}
                        </TableCell>
                        <TableCell className="py-2 text-right whitespace-nowrap">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground/80 hover:text-foreground size-8 hover:bg-transparent"
                            aria-label={`Open ${name}`}
                            onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                            title="Open preview"
                          >
                            <ExternalLinkIcon className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground/80 hover:text-foreground size-8 hover:bg-transparent"
                            aria-label={`Download ${name}`}
                            onClick={() => downloadOne(entry)}
                            title="Download"
                          >
                            <DownloadIcon className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
        </>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          {files.length === 0 ? "No files yet. Add or drop files above." : "No files match your search."}
        </p>
      )}

      {/* -- Errors -- */}
      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}
